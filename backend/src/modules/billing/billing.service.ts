import { OrderStatus, PaymentStatus, type PaymentMethod } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { type RevenuePeriod, getPeriodStartDate } from "../../utils/date.js";
import { broadcastInvalidation } from "../../realtime/events.js";

const numberValue = (value: unknown) => Number(value ?? 0);
const withGst = (subtotal: number) => Number((subtotal + Number((subtotal * 0.05).toFixed(2))).toFixed(2));
const createPublicId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const getPeriod = (period?: string): RevenuePeriod => {
  if (period === "monthly" || period === "yearly") {
    return period;
  }
  return "weekly";
};

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
};

const getOrderItemCount = (items: Array<{ quantity: number }>) =>
  items.reduce((sum, item) => sum + item.quantity, 0);

const nextPaymentId = () => createPublicId("PAY");

export const getBillingSummary = async (period?: string | undefined) => {
  const selectedPeriod = getPeriod(period);
  const periodStart = getPeriodStartDate(selectedPeriod);
  const { start: todayStart, end: todayEnd } = todayRange();

  const [todaysRevenueAggregate, unpaidBills, paidToday, totalPayments] = await Promise.all([
    prisma.payment.aggregate({
      where: {
        status: PaymentStatus.COMPLETED,
        paidAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
      _sum: {
        amount: true,
      },
    }),
    prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.READY, OrderStatus.PENDING, OrderStatus.PREPARING],
        },
        createdAt: {
          gte: periodStart,
        },
        payments: {
          none: {
            status: PaymentStatus.COMPLETED,
          },
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: PaymentStatus.COMPLETED,
        paidAt: {
          gte: todayStart,
          lt: todayEnd,
        },
      },
    }),
    prisma.payment.count({
      where: {
        status: PaymentStatus.COMPLETED,
        paidAt: {
          gte: periodStart,
        },
      },
    }),
  ]);

  return {
    period: selectedPeriod,
    cards: {
      todaysRevenue: numberValue(todaysRevenueAggregate._sum.amount),
      unpaidBills,
      paidToday,
      totalPayments,
    },
  };
};

export const getPendingPaymentsTable = async (params: {
  period?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}) => {
  const selectedPeriod = getPeriod(params.period);
  const startDate = getPeriodStartDate(selectedPeriod);
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = {
    status: {
      in: [OrderStatus.READY, OrderStatus.PENDING, OrderStatus.PREPARING] as OrderStatus[],
    },
    createdAt: {
      gte: startDate,
    },
    ...(params.search
      ? {
          OR: [
            {
              orderNumber: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              customerName: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              customer: {
                phone: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            },
          ],
        }
      : {}),
    payments: {
      none: {
        status: PaymentStatus.COMPLETED,
      },
    },
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        items: {
          select: {
            quantity: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    period: selectedPeriod,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    rows: orders.map((order) => ({
      id: order.id,
      order: order.orderNumber,
      customer: order.customerName,
      table: order.tableNumber,
      items: getOrderItemCount(order.items),
      amount: withGst(numberValue(order.totalAmount)),
      status: order.status,
    })),
  };
};

export const getRecentPaymentsTable = async (params: {
  period?: string | undefined;
  search?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
}) => {
  const selectedPeriod = getPeriod(params.period);
  const startDate = getPeriodStartDate(selectedPeriod);
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const skip = (page - 1) * limit;

  const where = {
    status: PaymentStatus.COMPLETED,
    paidAt: {
      gte: startDate,
    },
    ...(params.search
      ? {
          OR: [
            {
              paymentId: {
                contains: params.search,
                mode: "insensitive" as const,
              },
            },
            {
              order: {
                orderNumber: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              order: {
                customerName: {
                  contains: params.search,
                  mode: "insensitive" as const,
                },
              },
            },
            {
              order: {
                customer: {
                  phone: {
                    contains: params.search,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: {
        paidAt: "desc",
      },
      skip,
      take: limit,
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    period: selectedPeriod,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    rows: payments.map((payment) => ({
      id: payment.id,
      paymentId: payment.paymentId,
      order: payment.order.orderNumber,
      amount: numberValue(payment.amount),
      method: payment.method,
      date: payment.paidAt,
      status: payment.status,
    })),
  };
};

export const processOrderPayment = async (payload: { orderId: string; method: PaymentMethod }) => {
  const order = await prisma.order.findUnique({
    where: {
      id: payload.orderId,
    },
    include: {
      payments: {
        where: {
          status: PaymentStatus.COMPLETED,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.payments.length > 0) {
    throw new Error("Payment already processed for this order");
  }

  const paymentId = await nextPaymentId();

  const payment = await prisma.payment.create({
    data: {
      paymentId,
      orderId: order.id,
      amount: withGst(numberValue(order.totalAmount)),
      method: payload.method,
      status: PaymentStatus.COMPLETED,
    },
  });

  await prisma.order.update({
    where: {
      id: order.id,
    },
    data: {
      status: OrderStatus.COMPLETED,
    },
  });

  broadcastInvalidation(["orders", "billing", "customers", "dashboard"]);
  return {
    id: payment.id,
    paymentId: payment.paymentId,
    orderId: payment.orderId,
    amount: numberValue(payment.amount),
    method: payment.method,
    status: payment.status,
    date: payment.paidAt,
  };
};

export const deletePendingOrder = async (orderId: string) => {
  await prisma.order.delete({
    where: {
      id: orderId,
    },
  });

  broadcastInvalidation(["orders", "billing", "customers", "dashboard"]);
  return { deleted: true };
};

export const deletePaymentById = async (paymentId: string) => {
  await prisma.payment.delete({
    where: {
      id: paymentId,
    },
  });

  broadcastInvalidation(["billing", "dashboard"]);
  return { deleted: true };
};
