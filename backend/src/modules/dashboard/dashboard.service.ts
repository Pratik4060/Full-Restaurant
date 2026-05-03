import { DietType, OrderStatus } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { type RevenuePeriod, getPeriodStartDate, isSameDate } from "../../utils/date.js";

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
};

const numberValue = (value: unknown) => Number(value ?? 0);

export const getDashboardCards = async () => {
  const { start, end } = todayRange();

  const [todaysOrders, todaysRevenue, pendingOrders, totalCustomers] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lt: end
        }
      }
    }),
    prisma.order.aggregate({
      where: {
        status: OrderStatus.COMPLETED,
        createdAt: {
          gte: start,
          lt: end
        }
      },
      _sum: {
        totalAmount: true
      }
    }),
    prisma.order.count({
      where: {
        status: OrderStatus.PENDING
      }
    }),
    prisma.customer.count()
  ]);

  return {
    todaysOrders,
    todaysRevenue: numberValue(todaysRevenue._sum.totalAmount),
    pendingOrders,
    totalCustomers
  };
};

export const getRevenueSeries = async (period: RevenuePeriod) => {
  const startDate = getPeriodStartDate(period);
  const now = new Date();

  const orders = await prisma.order.findMany({
    where: {
      status: OrderStatus.COMPLETED,
      createdAt: {
        gte: startDate,
        lte: now
      }
    },
    select: {
      createdAt: true,
      totalAmount: true
    }
  });

  if (period === "weekly") {
    const points = Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const total = orders
        .filter((order) => isSameDate(order.createdAt, date))
        .reduce((sum, order) => sum + numberValue(order.totalAmount), 0);

      return {
        label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: total
      };
    });
    return points;
  }

  if (period === "monthly") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const points = Array.from({ length: daysInMonth }).map((_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth(), index + 1);
      const total = orders
        .filter((order) => isSameDate(order.createdAt, date))
        .reduce((sum, order) => sum + numberValue(order.totalAmount), 0);

      return {
        label: `${index + 1}`,
        revenue: total
      };
    });
    return points;
  }

  const points = Array.from({ length: 12 }).map((_, index) => {
    const total = orders
      .filter((order) => order.createdAt.getMonth() === index)
      .reduce((sum, order) => sum + numberValue(order.totalAmount), 0);
    return {
      label: new Date(now.getFullYear(), index, 1).toLocaleDateString("en-US", { month: "short" }),
      revenue: total
    };
  });

  return points;
};

export const getOrderStatusDistribution = async () => {
  const statuses = [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.COMPLETED];

  const groupedCounts = await prisma.order.groupBy({
    by: ["status"],
    where: {
      status: {
        in: statuses,
      },
    },
    _count: {
      _all: true,
    },
  });

  const countsByStatus = new Map(
    groupedCounts.map((item) => [item.status, item._count._all])
  );

  return statuses.map((status) => ({
    status,
    count: countsByStatus.get(status) ?? 0
  }));
};

export const getActiveOffers = async () =>
  prisma.offer.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

export const getPopularItems = async () => {
  const items = await prisma.menuItem.findMany({
    where: {
      likeCount: {
        gt: 0,
      },
    },
    orderBy: {
      likeCount: "desc",
    },
    take: 30,
    select: {
      id: true,
      name: true,
      category: true,
      diet: true,
      likeCount: true,
    },
  });

  const all = items.map((item) => ({
    menuItemId: item.id,
    name: item.name,
    category: item.category,
    diet: item.diet,
    likes: item.likeCount,
  }));

  const isBeverage = (item: (typeof all)[number]) =>
    item.category === "Beverages" || item.diet === DietType.BEVERAGE;

  return {
    veg: all.filter((item) => item.diet === DietType.VEG && !isBeverage(item)),
    nonVeg: all.filter((item) => item.diet === DietType.NON_VEG && !isBeverage(item)),
    beverages: all.filter(isBeverage)
  };
};

export const getDashboardOverview = async (period: RevenuePeriod) => {
  const [summary, revenuePoints, orderStatus, activeOffers, popularItems] = await Promise.all([
    getDashboardCards(),
    getRevenueSeries(period),
    getOrderStatusDistribution(),
    getActiveOffers(),
    getPopularItems(),
  ]);

  return {
    summary,
    revenue: {
      period,
      points: revenuePoints,
    },
    orderStatus,
    activeOffers,
    popularItems,
  };
};
