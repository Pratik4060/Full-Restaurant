import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import { billingQuerySchema, processPaymentSchema } from "./billing.schema.js";
import {
  deletePaymentById,
  deletePendingOrder,
  getBillingSummary,
  getPendingPaymentsTable,
  getRecentPaymentsTable,
  processOrderPayment,
} from "./billing.service.js";

export const getBillingCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(billingQuerySchema, req.query);
    const data = await getBillingSummary(query.period);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getPendingPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(billingQuerySchema, req.query);
    const data = await getPendingPaymentsTable(query);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getRecentPayments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(billingQuerySchema, req.query);
    const data = await getRecentPaymentsTable(query);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(processPaymentSchema, req.body);
    const data = await processOrderPayment(payload);
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const removePendingOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await deletePendingOrder(String(req.params.id));
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const removePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await deletePaymentById(String(req.params.id));
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};
