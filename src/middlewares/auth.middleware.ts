import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export const authenticcate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Unauthorized"));
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET as string) as {
      userId: string;
      role: string;
    };
    (req as any).user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};
