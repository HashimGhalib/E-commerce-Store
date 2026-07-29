// server/src/utils/ApiError.ts
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors?: any[] | undefined;
    public readonly isOperational: boolean;

    constructor(
        statusCode: number,
        message: string,
        errors?: any[],
        isOperational = true,
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}