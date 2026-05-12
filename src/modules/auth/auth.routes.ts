import express from "express";
import { validate } from "../../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "./auth.schema";
import { login, refresh, register } from "./auth.controller";
const router = express.Router()


router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)
router.post("/refresh", refresh)
export default router;