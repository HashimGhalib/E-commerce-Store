const ROLES = {
    CUSTOMER: "customer",
    ADMIN: "admin",
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

