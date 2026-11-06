
import { User } from "../models/User.model";
import { ApiError } from "../utils/ApiError";
import { hashPassword, comparePassword } from "../utils/password";
import { generateAccessToken } from "../utils/jwt";

import type {
    RegisterUserInput,
    LoginUserInput,
} from "../validators/auth.validator";

import type { AuthResponse, AuthUser } from "shared";

/**
 * Converts a Mongoose user document into a safe response object.
 * This prevents sensitive fields such as the password hash
 * from being returned to the client.
 */
function toAuthUser(user: InstanceType<typeof User>): AuthUser {
    return {
        _id: user._id.toString(),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        provider: user.provider ?? "local",
        ...(user.image && { image: user.image }),
        role: user.role,
    };
}

/**
 * Register a new customer.
 */
export async function registerUser(
    input: RegisterUserInput
): Promise<AuthResponse> {
    const { firstName, lastName, email, password, image } = input;

    // Check whether the email is already registered.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new ApiError(
            409,
            "An account with this email already exists."
        );
    }

    // Hash the password before saving it.
    const hashedPassword = await hashPassword(password);

    // Create the user with safe default values.
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        provider: "local",
        role: "customer",
        ...(image && { image }),
    });

    // Generate an access token.
    const accessToken = generateAccessToken(
        user._id.toString(),
        user.role
    );

    return {
        user: toAuthUser(user),
        accessToken,
    };
}

/**
 * Authenticate an existing customer.
 */
export async function loginUser(
    input: LoginUserInput
): Promise<AuthResponse> {
    const { email, password } = input;

    // Explicitly select the password because the schema uses select: false.
    const user = await User.findOne({ email }).select("+password");

    // Use a generic error message to avoid revealing registered emails.
    if (!user || user.provider !== "local") {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Compare the supplied password with the stored hash.
    const isPasswordValid = await comparePassword(
        password,
        user.password
    );

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid email or password.");
    }

    // Generate an access token.
    const accessToken = generateAccessToken(
        user._id.toString(),
        user.role
    );

    return {
        user: toAuthUser(user),
        accessToken,
    };
}
