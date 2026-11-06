
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/**
 * Hashes a plain-text password before storing it in the database.
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain-text password with its stored bcrypt hash.
 */
export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}
