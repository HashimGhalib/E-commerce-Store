// router file
import type { Request, Response } from "express";
import { ApiResponse } from "shared";

const { Router } = require("express");
const router = Router();

router.get("/health", (_req: Request, res: Response<ApiResponse<object>>) => {
    res.status(200).json({
        success: true,
        message: "OK",
        data: {},
    });
});

export default router;