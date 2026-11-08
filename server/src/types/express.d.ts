import type { Role } from "shared";

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role: Role;
            };
        }
    }
}

export { };

