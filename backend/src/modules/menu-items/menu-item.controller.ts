// C:\Project\AdminRestaurant\backend\src\modules\menu-items\menu-item.controller.ts
import { DietType, MealType } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import { createMenuItemSchema, updateMenuItemSchema } from "./menu-item.schema.js";
import { createMenuItem, deleteMenuItem, listMenuItems, updateMenuItem } from "./menu-item.service.js";

const parseDiet = (value?: string) =>
  value && Object.values(DietType).includes(value as DietType) ? (value as DietType) : undefined;

const parseType = (value?: string) =>
  value && Object.values(MealType).includes(value as MealType) ? (value as MealType) : undefined;

export const getMenuItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const diet = parseDiet(req.query.diet as string | undefined);
    const type = parseType(req.query.type as string | undefined);
    const category = req.query.category as string | undefined;
    const subCategory = req.query.subCategory as string | undefined;

    const filters: { diet?: DietType; type?: MealType; category?: string; subCategory?: string } = {};
    if (diet !== undefined) filters.diet = diet;
    if (type !== undefined) filters.type = type;
    if (category !== undefined) filters.category = category;
    if (subCategory !== undefined) filters.subCategory = subCategory;

    const items = await listMenuItems(filters);
    res.json(items);
  } catch (error) {
    next(error as Error);
  }
};

export const postMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(createMenuItemSchema, req.body);
    const item = await createMenuItem(payload);
    res.status(201).json(item);
  } catch (error) {
    next(error as Error);
  }
};

export const putMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(updateMenuItemSchema, req.body);
    const item = await updateMenuItem(String(req.params.id), payload);
    res.json(item);
  } catch (error) {
    next(error as Error);
  }
};

export const removeMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteMenuItem(String(req.params.id));
    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
};
