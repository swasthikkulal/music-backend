import { NextFunction } from "express";
import { Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate = (Schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = Schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
};
