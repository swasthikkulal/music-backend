import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../../utils/apiResponse";
import * as authService from "./auth.service";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await authService.registerUser(
      req.body.name,
      req.body.email,
      req.body.password,
    );
    sendResponse(res, 201, "Registered successfully", data);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await authService.loginUser(req.body.email, req.body.password);
    sendResponse(res, 200, "Logged in successfully", data);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    const data = await authService.refreshToken(refreshToken);
    sendResponse(res, 200, "Token refreshed successfully", data);
  } catch (error) {
    next(error);
  }
};
