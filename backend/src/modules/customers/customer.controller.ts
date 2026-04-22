import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import { bulkDeleteCustomersSchema, customersQuerySchema } from "./customer.schema.js";
import {
  bulkDeleteCustomers,
  deleteCustomerById,
  getCustomerCards,
  getCustomersTable,
} from "./customer.service.js";

export const getCustomerSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(customersQuerySchema, req.query);
    const data = await getCustomerCards(query.period);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(customersQuerySchema, req.query);
    const data = await getCustomersTable(query);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await deleteCustomerById(String(req.params.id));
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const deleteManyCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(bulkDeleteCustomersSchema, req.body);
    const data = await bulkDeleteCustomers(payload.ids);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};
