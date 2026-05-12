import { NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { Request, Response } from "express";
import { success } from "zod";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof ApiError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }
  console.log(err)
  return res
    .status(500)
    .json({ success: false, message: "internal server error" });
};
