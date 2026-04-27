import { DietType, MealType  } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import type { CreateMenuItemInput, UpdateMenuItemInput } from "./menu-item.schema.js";
import { broadcastInvalidation } from "../../realtime/events.js";

type MenuItemFilters = {
  diet?: DietType;
  type?: MealType;
  category?: string;
  subCategory?: string;
};

const toNumber = (value: unknown): number => Number(value ?? 0);
const serializeMenuItem = <T extends { price: unknown }>(item: T) => ({
  ...item,
  price: toNumber(item.price),
});

export const listMenuItems = async (filters: MenuItemFilters) => {
  const where: MenuItemFilters = {};

  if (filters.diet !== undefined) where.diet = filters.diet;
  if (filters.type !== undefined) where.type = filters.type;
  if (filters.category !== undefined) where.category = filters.category;
  if (filters.subCategory !== undefined) where.subCategory = filters.subCategory;

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return items.map((item: (typeof items)[number]) => serializeMenuItem(item));
};

export const createMenuItem = async (payload: CreateMenuItemInput) => {
  const item = await prisma.menuItem.create({
    data: {
      name: payload.name,
      description: payload.description,
      price: payload.price,
      prepTimeMins: payload.prepTimeMins,
      type: payload.type,
      category: payload.category,
      ...(payload.subCategory !== undefined ? { subCategory: payload.subCategory } : {}),
      diet: payload.diet,
      ...(payload.isBestseller !== undefined ? { isBestseller: payload.isBestseller } : {}),
      ...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.isAvailable !== undefined ? { isAvailable: payload.isAvailable } : {}),
    },
  });
  broadcastInvalidation(["menu-items", "dashboard"]);
  return serializeMenuItem(item);
};

export const updateMenuItem = async (menuItemId: string, payload: UpdateMenuItemInput) => {
  const data: Record<string, unknown> = {};

  if (typeof payload.name === "string") data.name = payload.name;
  if (typeof payload.description === "string") data.description = payload.description;
  if (typeof payload.imageUrl === "string") data.imageUrl = payload.imageUrl;
  if (typeof payload.price === "number") data.price = payload.price;
  if (typeof payload.prepTimeMins === "number") data.prepTimeMins = payload.prepTimeMins;
  if (payload.type !== undefined) data.type = payload.type;
  if (typeof payload.category === "string") data.category = payload.category;
  if (typeof payload.subCategory === "string") data.subCategory = payload.subCategory;
  if (payload.diet !== undefined) data.diet = payload.diet;
  if (typeof payload.isBestseller === "boolean") data.isBestseller = payload.isBestseller;
  if (typeof payload.isAvailable === "boolean") data.isAvailable = payload.isAvailable;

  const item = await prisma.menuItem.update({
    where: { id: menuItemId },
    data,
  });
  broadcastInvalidation(["menu-items", "dashboard"]);
  return serializeMenuItem(item);
};


export const deleteMenuItem = async (menuItemId: string) => {
  const deleted = await prisma.menuItem.delete({
    where: { id: menuItemId },
  });
  broadcastInvalidation(["menu-items", "dashboard"]);
  return deleted;
};
