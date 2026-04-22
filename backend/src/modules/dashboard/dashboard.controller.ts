import type{ NextFunction, Request, Response } from "express";
import {
  getActiveOffers,
  getDashboardCards,
  getOrderStatusDistribution,
  getPopularItems,
  getRevenueSeries
} from "./dashboard.service.js";
import type{ RevenuePeriod } from "../../utils/date.js";

const parsePeriod = (period?: string): RevenuePeriod => {
  if (period === "monthly" || period === "yearly") {
    return period;
  }
  return "weekly";
};

export const summary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getDashboardCards();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const revenue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = parsePeriod(req.query.period as string | undefined);
    const data = await getRevenueSeries(period);
    res.json({ period, points: data });
  } catch (error) {
    next(error as Error);
  }
};

export const orderStatus = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getOrderStatusDistribution();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const activeOffers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getActiveOffers();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const popularItems = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPopularItems();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};
