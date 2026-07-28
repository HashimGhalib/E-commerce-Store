import { ApiResponse } from "shared";

function baseUrl() {
    return typeof window === 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://localhost:5000/api/v1';
}

class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const res = await fetch(`${baseUrl()}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',

            // TODO: forward the real authenticated user id once auth is added
            // 'x-user-id': process.env.NEXT_PUBLIC_DEV_FAKE_USER_ID ?? '000000000000000000000000',
            ...init?.headers,
        },
        // Server Components: avoid Next's fetch cache for this dynamic data
        cache: 'no-store',
    });

    if (res.status === 204) return {
        success: true,
        message: "",
        data: undefined as T,
    };

    const body: ApiResponse<T> = await res.json();


    if (!res.ok) {
        throw new ApiError(body.message ?? `Request failed with status ${res.status}`, res.status);
    }

    return body;
}


// health status
export async function healthStatus() {
    return request<ApiResponse<object>>('/health');
}

