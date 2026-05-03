import { DietType, MealType, OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { broadcastInvalidation, broadcastOrderCreated } from "../../realtime/events.js";

const numberValue = (value: unknown) => Number(value ?? 0);

const calculateTotals = (subtotal: number) => {
  const gst = Number((subtotal * 0.05).toFixed(2));
  return {
    subtotal,
    gst,
    totalAmount: Number((subtotal + gst).toFixed(2)),
  };
};

type PublicMenuItemInput = {
  menuItemId?: string | undefined;
  name: string;
  description: string;
  imageUrl?: string | undefined;
  price: number;
  prepTimeMins?: number | undefined;
  type: MealType;
  category: string;
  subCategory?: string | undefined;
  diet: DietType;
  isBestseller?: boolean | undefined;
};

const serializeMenuItem = (item: {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  price: Prisma.Decimal;
  prepTimeMins: number;
  type: MealType;
  category: string;
  subCategory: string | null;
  diet: DietType;
  isBestseller: boolean;
  likeCount: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...item,
  price: numberValue(item.price),
});

const serializePublicOrder = (order: {
  id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  guestCount: number;
  status: OrderStatus;
  totalAmount: Prisma.Decimal;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
    menuItem: {
      id: string;
      name: string;
      imageUrl: string | null;
      description: string;
      type: MealType;
      category: string;
      subCategory: string | null;
      diet: DietType;
    };
  }>;
  payments: Array<{
    id: string;
    paymentId: string;
    amount: Prisma.Decimal;
    method: PaymentMethod;
    status: PaymentStatus;
    paidAt: Date;
  }>;
}) => {
  const subtotal = numberValue(order.totalAmount);
  const totals = calculateTotals(subtotal);
  const payment = order.payments[0] ?? null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    tableNumber: order.tableNumber,
    guestCount: order.guestCount,
    status: order.status,
    subtotal: totals.subtotal,
    gst: totals.gst,
    totalAmount: totals.totalAmount,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      menuItemId: item.menuItem.id,
      name: item.menuItem.name,
      description: item.menuItem.description,
      imageUrl: item.menuItem.imageUrl,
      quantity: item.quantity,
      unitPrice: numberValue(item.unitPrice),
      totalPrice: numberValue(item.totalPrice),
      type: item.menuItem.type,
      category: item.menuItem.category,
      subCategory: item.menuItem.subCategory,
      diet: item.menuItem.diet,
    })),
    payment: payment
      ? {
          id: payment.id,
          paymentId: payment.paymentId,
          amount: numberValue(payment.amount),
          method: payment.method,
          status: payment.status,
          paidAt: payment.paidAt,
        }
      : null,
  };
};

const nextPaymentId = async () => {
  const count = await prisma.payment.count();
  return `PAY-${1001 + count}`;
};

const generateOrderNumber = async () => {
  const count = await prisma.order.count();
  return `ORD-${1001 + count}`;
};

const ensureCustomer = async (payload: { customerName: string; customerPhone?: string | undefined }) => {
  if (payload.customerPhone) {
    const existingByPhone = await prisma.customer.findFirst({
      where: {
        phone: payload.customerPhone,
      },
    });

    if (existingByPhone) {
      return prisma.customer.update({
        where: { id: existingByPhone.id },
        data: { name: payload.customerName },
      });
    }
  }

  const existingByName = await prisma.customer.findFirst({
    where: {
      name: payload.customerName,
    },
  });

  if (existingByName) {
    return existingByName;
  }

  return prisma.customer.create({
    data: {
      name: payload.customerName,
      phone: payload.customerPhone ?? null,
    },
  });
};

const resolveMenuItem = async (payload: PublicMenuItemInput) => {
  if (payload.menuItemId) {
    const existing = await prisma.menuItem.findUnique({
      where: { id: payload.menuItemId },
    });

    if (existing) return existing;
  }

  const existing = await prisma.menuItem.findFirst({
    where: {
      name: payload.name,
      type: payload.type,
      category: payload.category,
      diet: payload.diet,
      ...(payload.subCategory ? { subCategory: payload.subCategory } : {}),
    },
  });

  if (existing) return existing;

  throw new Error(`Menu item not found: ${payload.name}`);
};

export const listPublicMenuItems = async (filters: {
  type?: MealType | undefined;
  diet?: DietType | undefined;
  category?: string | undefined;
  subCategory?: string | undefined;
  search?: string | undefined;
}) => {
  const items = await prisma.menuItem.findMany({
    where: {
      isAvailable: true,
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.diet ? { diet: filters.diet } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.subCategory ? { subCategory: filters.subCategory } : {}),
      ...(filters.search
        ? {
            OR: [
              {
                name: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: filters.search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
  });

  return items.map(serializeMenuItem);
};

export const listPublicOffers = async () =>
  prisma.offer.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

export const registerPublicCustomer = async (payload: {
  customerName: string;
  customerPhone?: string | undefined;
}) => {
  const customer = await ensureCustomer({
    customerName: payload.customerName,
    ...(payload.customerPhone !== undefined ? { customerPhone: payload.customerPhone } : {}),
  });

  broadcastInvalidation(["customers", "dashboard"]);
  return customer;
};

export const likePublicMenuItem = async (payload: PublicMenuItemInput) => {
  const item = await resolveMenuItem(payload);
  const updated = await prisma.menuItem.update({
    where: { id: item.id },
    data: {
      likeCount: {
        increment: 1,
      },
    },
  });

  broadcastInvalidation(["menu-items", "dashboard"]);
  return serializeMenuItem(updated);
};

export const createPublicOrder = async (payload: {
  customerName: string;
  customerPhone?: string | undefined;
  tableNumber: string;
  guestCount: number;
  items: Array<PublicMenuItemInput & { quantity: number }>;
}) => {
  const customer = await ensureCustomer({
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
  });

  const resolvedItems = await Promise.all(
    payload.items.map(async (item) => ({
      payload: item,
      menuItem: await resolveMenuItem(item),
    })),
  );

  const subtotal = resolvedItems.reduce((sum, { menuItem, payload: item }) => {
    const unitPrice = numberValue(menuItem.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber,
      guestCount: payload.guestCount,
      status: OrderStatus.PENDING,
      totalAmount: subtotal,
      items: {
        create: resolvedItems.map(({ menuItem, payload: item }) => {
          const unitPrice = numberValue(menuItem.price);

          return {
            menuItemId: menuItem.id,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          };
        }),
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      payments: true,
    },
  });

  broadcastOrderCreated({
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    tableNumber: order.tableNumber,
    totalAmount: numberValue(order.totalAmount),
  });
  broadcastInvalidation(["orders", "customers", "billing", "dashboard"]);
  return serializePublicOrder(order);
};

export const getPublicOrder = async (orderNumber: string) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
        },
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return serializePublicOrder(order);
};

export const payPublicOrder = async (orderNumber: string, method: PaymentMethod) => {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
        },
      },
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.payments.length === 0) {
    const totals = calculateTotals(numberValue(order.totalAmount));
    const paymentId = await nextPaymentId();

    await prisma.payment.create({
      data: {
        paymentId,
        orderId: order.id,
        amount: totals.totalAmount,
        method,
        status: PaymentStatus.COMPLETED,
      },
    });
  }

  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.COMPLETED,
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
        },
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  broadcastInvalidation(["orders", "billing", "customers", "dashboard"]);
  return serializePublicOrder(updatedOrder);
};
