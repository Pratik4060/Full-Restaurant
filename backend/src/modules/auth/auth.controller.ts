import type { Request, Response, NextFunction } from "express";
import { validate } from "../../utils/validate.js";
import { loginSchema } from "./auth.schema.js";
import { loginAdmin } from "./auth.service.js";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = validate(loginSchema, req.body);
    const result = await loginAdmin(payload);
    res.json(result);
  } catch (error) {
    next(error as Error);
  }
};
