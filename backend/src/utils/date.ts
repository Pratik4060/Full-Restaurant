export type RevenuePeriod = "weekly" | "monthly" | "yearly";

export const getPeriodStartDate = (period: RevenuePeriod) => {
  const now = new Date();

  if (period === "weekly") {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  if (period === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  const start = new Date(now.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();