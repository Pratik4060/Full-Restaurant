import type { NextFunction, Request, Response } from "express";
import { validate } from "../../utils/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  usersQuerySchema,
} from "./user.schema.js";
import {
  createUser,
  deleteUserById,
  getUserCards,
  getUsersTable,
  updateUser,
  updateUserStatus,
} from "./user.service.js";

export const getUsersSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getUserCards();
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = validate(usersQuerySchema, req.query);
    const data = await getUsersTable(query);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const postUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(createUserSchema, req.body);
    const data = await createUser(payload);
    res.status(201).json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const patchUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(updateUserSchema, req.body);
    const data = await updateUser(String(req.params.id), payload);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const patchUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(updateUserStatusSchema, req.body);
    const data = await updateUserStatus(String(req.params.id), payload.isActive);
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await deleteUserById(String(req.params.id));
    res.json(data);
  } catch (error) {
    next(error as Error);
  }
};
