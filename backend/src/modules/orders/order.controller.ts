import type { NextFunction, Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { validate } from "../../utils/validate.js";
import { createOrderSchema, updateOrderStatusSchema } from "./order.schema.js";
import { createOrder, listOrders, updateOrderStatus } from "./order.service.js";

export const getOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusQuery = req.query.status as string | undefined;
    const searchQuery = req.query.search as string | undefined;

    const status =
      statusQuery && Object.values(OrderStatus).includes(statusQuery as OrderStatus)
        ? (statusQuery as OrderStatus)
        : undefined;

    const orders = await listOrders(status, searchQuery);
    res.json(orders);
  } catch (error) {
    next(error as Error);
  }
};

export const postOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(createOrderSchema, req.body);
    const order = await createOrder(payload);
    res.status(201).json(order);
  } catch (error) {
    next(error as Error);
  }
};

export const patchOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = validate(updateOrderStatusSchema, req.body);
    const order = await updateOrderStatus(String(req.params.id), status);
    res.json(order);
  } catch (error) {
    next(error as Error);
  }
};
