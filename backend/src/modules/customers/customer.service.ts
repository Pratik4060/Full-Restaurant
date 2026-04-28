import { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { type RevenuePeriod, getPeriodStartDate } from "../../utils/date.js";
import { broadcastInvalidation } from "../../realtime/events.js";

const numberValue = (value: unknown) => Number(value ?? 0);

const getPeriod = (period?: string): RevenuePeriod => {
  if (period === "monthly" || period === "yearly") {
    return period;
  }
  return "weekly";
};

const buildSearchFilter = (search?: string): Prisma.CustomerWhereInput | undefined => {
  if (!search) {
    return undefined;
  }

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
      {
        phone: {
          contains: search,
          mode: "insensitive" as const,
        },
      },
    ],
  };
};

const customersWithOrdersFilter: Prisma.CustomerWhereInput = {
  orders: {
    some: {},
  },
};

type CustomerWithOrders = Prisma.CustomerGetPayload<{
  include: {
    orders: {
      select: {
        id: true;
        tableNumber: true;
        guestCount: true;
        totalAmount: true;
        status: true;
        createdAt: true;
      };
    };
  };
}>;

export const getCustomerCards = async (period?: string | undefined) => {
  const selectedPeriod = getPeriod(period);
  const startDate = getPeriodStartDate(selectedPeriod);

  const [uniqueCustomers, totalOrders, revenueAggregate, completedOrdersCount] = await Promise.all([
    prisma.order.groupBy({
      by: ["customerId"],
      where: {
        customerId: {
          not: null,
        },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: startDate,
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: startDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: startDate,
        },
      },
    }),
  ]);

  const totalRevenue = numberValue(revenueAggregate._sum.totalAmount);

  return {
    period: selectedPeriod,
    cards: {
      totalCustomers: uniqueCustomers.length,
      totalOrders,
      totalRevenue,
      averageOrderValue: completedOrdersCount > 0 ? Number((totalRevenue / completedOrdersCount).toFixed(2)) : 0,
    },
  };
};

export const getCustomersTable = async (params: {
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

  const where = buildSearchFilter(params.search);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: startDate,
      },
      ...(where
        ? {
            OR: [
              {
                customerName: {
                  contains: params.search ?? "",
                  mode: "insensitive" as const,
                },
              },
              {
                customer: {
                  phone: {
                    contains: params.search ?? "",
                    mode: "insensitive" as const,
                  },
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
  });

  const grouped = new Map<
    string,
    {
      id: string;
      customerName: string;
      contactNumber: string | null;
      numberOfGuest: number;
      tableNumber: string | null;
      numberOfOrders: number;
      totalSpent: number;
      lastVisit: Date | null;
    }
  >();

  for (
    const order of orders as Array<{
      id: string;
      customerId: string | null;
      customerName: string;
      tableNumber: string;
      guestCount: number;
      totalAmount: unknown;
      status: OrderStatus;
      createdAt: Date;
      customer: { id: string; name: string; phone: string | null } | null;
    }>
  ) {
    const id = order.customer?.id ?? order.customerId ?? order.id;
    const existing = grouped.get(id);
    const totalSpent = order.status === OrderStatus.COMPLETED ? numberValue(order.totalAmount) : 0;

    if (!existing) {
      grouped.set(id, {
        id,
        customerName: order.customer?.name ?? order.customerName,
        contactNumber: order.customer?.phone ?? null,
        numberOfGuest: order.guestCount,
        tableNumber: order.tableNumber,
        numberOfOrders: 1,
        totalSpent,
        lastVisit: order.createdAt,
      });
      continue;
    }

    existing.numberOfOrders += 1;
    existing.totalSpent += totalSpent;
    if (order.createdAt > (existing.lastVisit ?? new Date(0))) {
      existing.lastVisit = order.createdAt;
      existing.numberOfGuest = order.guestCount;
      existing.tableNumber = order.tableNumber;
    }
  }

  const groupedRows = [...grouped.values()].sort(
    (a, b) => (b.lastVisit?.getTime() ?? 0) - (a.lastVisit?.getTime() ?? 0)
  );
  const total = groupedRows.length;
  const rows = groupedRows.slice(skip, skip + limit).map((row) => ({
    id: row.id,
    customerName: row.customerName,
    contactNumber: row.contactNumber,
    numberOfGuest: row.numberOfGuest,
    tableNumber: row.tableNumber,
    numberOfOrders: row.numberOfOrders,
    totalSpent: row.totalSpent,
    lastVisit: row.lastVisit,
  }));

  return {
    period: selectedPeriod,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
    rows,
  };
};

export const deleteCustomerById = async (customerId: string) => {
  await prisma.customer.delete({
    where: {
      id: customerId,
    },
  });

  broadcastInvalidation(["customers", "dashboard"]);
  return { deleted: true };
};

export const bulkDeleteCustomers = async (customerIds: string[]) => {
  const result = await prisma.customer.deleteMany({
    where: {
      id: {
        in: customerIds,
      },
    },
  });

  broadcastInvalidation(["customers", "dashboard"]);
  return {
    deletedCount: result.count,
  };
};
