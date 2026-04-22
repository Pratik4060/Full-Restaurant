import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorMiddleware = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error"
  });
};
