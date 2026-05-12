import { env } from "../../config/env";
import jwt from "jsonwebtoken";
import prisma from "../../config/db";
import { ApiError } from "../../utils/apiError";
import bcrypt from "bcryptjs";
import { NextFunction } from "express";
import { id } from "zod/v4/locales";

const generateToken = (userId: string, role: string) => {
  const accessToken = jwt.sign({ userId, role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as any,
  });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as any,
  });
  return { accessToken, refreshToken };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
    },
  });
  const { accessToken, refreshToken } = generateToken(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });
  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new ApiError(401, "Invalid credentials");
  }
  const { accessToken, refreshToken } = generateToken(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
};

export const refreshToken = async (token: string) => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as {
    userId: string;
    role: string;
  };
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invaid token");
  }
  const { accessToken, refreshToken } = generateToken(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
};
