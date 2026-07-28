export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}