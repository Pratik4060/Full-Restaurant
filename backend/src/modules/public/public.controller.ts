import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import {
  publicCreateOrderSchema,
  publicLikeMenuItemSchema,
  publicMenuQuerySchema,
  publicPayOrderSchema,
  publicRegisterCustomerSchema,
} from "./public.schema.js";
import {
  createPublicOrder,
  getPublicOrder,
  likePublicMenuItem,
  listPublicMenuItems,
  listPublicOffers,
  payPublicOrder,
  registerPublicCustomer,
} from "./public.service.js";

export const getPublicMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(publicMenuQuerySchema, req.query);
    const data = await listPublicMenuItems({
      ...(query.type !== undefined ? { type: query.type } : {}),
      ...(query.diet !== undefined ? { diet: query.diet } : {}),
      ...(query.category !== undefined ? { category: query.category } : {}),
      ...(query.subCategory !== undefined ? { subCategory: query.subCategory } : {}),
      ...(query.search !== undefined ? { search: query.search } : {}),
    });
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getPublicOffers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listPublicOffers();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postPublicCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(publicRegisterCustomerSchema, req.body);
    const data = await registerPublicCustomer({
      customerName: payload.customerName,
      ...(payload.customerPhone !== undefined ? { customerPhone: payload.customerPhone } : {}),
    });
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postPublicLike = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(publicLikeMenuItemSchema, req.body);
    const data = await likePublicMenuItem({
      ...(payload.menuItemId !== undefined ? { menuItemId: payload.menuItemId } : {}),
      name: payload.name,
      description: payload.description,
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      price: payload.price,
      ...(payload.prepTimeMins !== undefined ? { prepTimeMins: payload.prepTimeMins } : {}),
      type: payload.type,
      category: payload.category,
      ...(payload.subCategory !== undefined ? { subCategory: payload.subCategory } : {}),
      diet: payload.diet,
      ...(payload.isBestseller !== undefined ? { isBestseller: payload.isBestseller } : {}),
    });
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postPublicOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(publicCreateOrderSchema, req.body);
    const data = await createPublicOrder({
      customerName: payload.customerName,
      ...(payload.customerPhone !== undefined ? { customerPhone: payload.customerPhone } : {}),
      tableNumber: payload.tableNumber,
      guestCount: payload.guestCount,
      items: payload.items.map((item) => ({
        ...(item.menuItemId !== undefined ? { menuItemId: item.menuItemId } : {}),
        name: item.name,
        description: item.description,
        ...(item.imageUrl !== undefined ? { imageUrl: item.imageUrl } : {}),
        price: item.price,
        ...(item.prepTimeMins !== undefined ? { prepTimeMins: item.prepTimeMins } : {}),
        type: item.type,
        category: item.category,
        ...(item.subCategory !== undefined ? { subCategory: item.subCategory } : {}),
        diet: item.diet,
        ...(item.isBestseller !== undefined ? { isBestseller: item.isBestseller } : {}),
        quantity: item.quantity,
      })),
    });
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getPublicOrderByNumber = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getPublicOrder(String(req.params.orderNumber));
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postPublicPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(publicPayOrderSchema, req.body);
    const data = await payPublicOrder(String(req.params.orderNumber), payload.method);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};
