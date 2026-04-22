import { OrderStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { type RevenuePeriod, getPeriodStartDate } from "../../utils/date.js";

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

  const [totalCustomers, totalOrders, revenueAggregate, completedOrdersCount] = await Promise.all([
    prisma.customer.count(),
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
      totalCustomers,
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

  const customerFindArgs: Prisma.CustomerFindManyArgs = {
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
    include: {
      orders: {
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          tableNumber: true,
          guestCount: true,
          totalAmount: true,
          status: true,
          createdAt: true,
        },
      },
    },
  };

  const customerCountArgs: Prisma.CustomerCountArgs = {};

  if (where) {
    customerFindArgs.where = where;
    customerCountArgs.where = where;
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany(customerFindArgs) as Promise<CustomerWithOrders[]>,
    prisma.customer.count(customerCountArgs),
  ]);

  const rows = customers.map((customer) => {
    const lastOrder = customer.orders[0] ?? null;
    const completedOrders = customer.orders.filter((order) => order.status === OrderStatus.COMPLETED);
    const totalSpent = completedOrders.reduce(
      (sum: number, order: (typeof completedOrders)[number]) => sum + numberValue(order.totalAmount),
      0
    );

    return {
      id: customer.id,
      customerName: customer.name,
      contactNumber: customer.phone,
      numberOfGuest: lastOrder?.guestCount ?? 0,
      tableNumber: lastOrder?.tableNumber ?? null,
      numberOfOrders: customer.orders.length,
      totalSpent,
      lastVisit: lastOrder?.createdAt ?? null,
    };
  });

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

  return {
    deletedCount: result.count,
  };
};
