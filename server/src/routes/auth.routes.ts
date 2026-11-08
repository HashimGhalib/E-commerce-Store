
import { Router } from "express";

import {
    register,
    login,
    refresh,
    logout,
} from "../controllers/auth.controller";

import { validate } from "../middlewares/validate.middleware";

import {
    registerUserSchema,
    loginUserSchema,
} from "../validators/auth.validator";

const router = Router();

// Register a new account.
router.post(
    "/register",
    validate(registerUserSchema),
    register
);

// Log in.
router.post(
    "/login",
    validate(loginUserSchema),
    login
);

// Obtain a new access token.
router.post(
    "/refresh",
    refresh
);

// Log out.
router.post(
    "/logout",
    logout
);

export default router;
