import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import { env } from "../config/env.js";

type AuthJwtPayload = BaseJwtPayload & {
  adminId: string;
  email: string;
};

const isAuthJwtPayload = (value: unknown): value is AuthJwtPayload => {
  if (!value || typeof value !== "object") return false;
  return "adminId" in value && "email" in value;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (typeof decoded === "string" || !isAuthJwtPayload(decoded)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = {
      adminId: String(decoded.adminId),
      email: String(decoded.email),
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
