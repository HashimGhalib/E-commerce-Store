// server/src/utils/ApiResponse.ts
import { Response } from "express";
import { ApiResponse as IApiResponse, PaginatedResponse as IPaginatedResponse } from "shared";

export class ApiResponse {
    /**
     * Send a standard API success response
     */
    static success<T>(
        res: Response<IApiResponse<T>>,
        statusCode: number,
        data?: T,
        message?: string
    ): void {
        res.status(statusCode).json({
            success: true,
            ...(message && { message }),
            ...(data !== undefined && { data }),
        });
    }

    /**
     * Send a standard paginated response
     */
    static paginated<T>(
        res: Response<IPaginatedResponse<T>>,
        statusCode: number,
        data: T[],
        page: number,
        limit: number,
        total: number,
        message?: string
    ): void {
        const totalPages = Math.ceil(total / limit) || 1;
        res.status(statusCode).json({
            success: true,
            ...(message && { message }),
            data,
            page,
            limit,
            total,
            totalPages,
        });
    }
}