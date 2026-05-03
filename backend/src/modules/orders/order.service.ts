import { OrderStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { CreateOrderInput } from "./order.schema.js";
import { broadcastInvalidation } from "../../realtime/events.js";

const numberValue = (value: unknown) => Number(value ?? 0);
const serializeOrder = <T extends { totalAmount: unknown; items?: Array<{ unitPrice: unknown; totalPrice: unknown }> }>(order: T) => ({
  ...order,
  totalAmount: numberValue(order.totalAmount),
  items: (order.items ?? []).map((item) => ({
    ...item,
    unitPrice: numberValue(item.unitPrice),
    totalPrice: numberValue(item.totalPrice),
  })),
});

const generateOrderNumber = async () => {
  const count = await prisma.order.count();
  return `ORD-${1001 + count}`;
};

export const listOrders = async (status?: OrderStatus, search?: string) => {
  const where: Record<string, unknown> = {};

  if (status !== undefined) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" as const } },
      { customerName: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const orders = (await prisma.order.findMany({
    where,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      tableNumber: true,
      guestCount: true,
      status: true,
      totalAmount: true,
      createdAt: true,
      updatedAt: true,
      items: {
        select: {
          id: true,
          orderId: true,
          menuItemId: true,
          quantity: true,
          unitPrice: true,
          totalPrice: true,
          menuItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })) as any[];

  return orders.map((order) => serializeOrder(order));
};

export const createOrder = async (payload: CreateOrderInput) => {
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: {
        in: payload.items.map((item: (typeof payload.items)[number]) => item.menuItemId),
      },
    },
  });

  if (menuItems.length !== payload.items.length) {
    throw new Error("Some menu items are invalid");
  }

  let customer = await prisma.customer.findFirst({
    where: { name: payload.customerName },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: payload.customerName,
        phone: payload.customerPhone ?? null,
      },
    });
  }

  const totalAmount = payload.items.reduce(
    (sum: number, requestedItem: (typeof payload.items)[number]) => {
      const menuItem = menuItems.find(
        (item: (typeof menuItems)[number]) => item.id === requestedItem.menuItemId
      );
      if (!menuItem) return sum;
      return sum + numberValue(menuItem.price) * requestedItem.quantity;
    },
    0
  );

  const orderNumber = await generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerId: customer.id,
      customerName: payload.customerName,
      tableNumber: payload.tableNumber,
      guestCount: payload.guestCount ?? 1,
      status: OrderStatus.PENDING,
      totalAmount,
      items: {
        create: payload.items.map((requestedItem: (typeof payload.items)[number]) => {
          const menuItem = menuItems.find(
            (item: (typeof menuItems)[number]) => item.id === requestedItem.menuItemId
          )!;
          return {
            menuItemId: menuItem.id,
            quantity: requestedItem.quantity,
            unitPrice: menuItem.price,
            totalPrice: numberValue(menuItem.price) * requestedItem.quantity,
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
    },
  });
  broadcastInvalidation(["orders", "customers", "billing", "dashboard"]);
  return serializeOrder(order);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const result = await prisma.order.updateMany({
    where: { id: orderId },
    data: { status },
  });

  if (result.count === 0) {
    throw new Error("Order not found");
  }

  broadcastInvalidation(["orders", "billing", "dashboard"]);
  return {
    id: orderId,
    status,
    updatedAt: new Date().toISOString(),
  };
};
