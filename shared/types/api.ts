export interface ApiResponse<T = void> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    message?: string;
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}