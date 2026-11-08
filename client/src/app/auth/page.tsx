
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "login" | "register";

export default function AuthPage() {
    const router = useRouter();
    const { login, register } = useAuth();

    const [mode, setMode] = useState<AuthMode>("login");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
    });

    const isRegister = mode === "register";

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function switchMode(newMode: AuthMode) {
        setMode(newMode);
        setError("");
        setShowPassword(false);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setIsSubmitting(true);

        try {
            if (isRegister) {
                await register({
                    firstName: formData.firstName.trim(),
                    lastName: formData.lastName.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                });
            } else {
                await login({
                    email: formData.email.trim(),
                    password: formData.password,
                });
            }

            router.replace("/");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-md">

                {/* Brand */}
                <div className="mb-8 text-center">
                    <a
                        href="/"
                        className="font-heading text-2xl font-bold tracking-tight text-primary"
                    >
                        Goayo
                    </a>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Welcome to your shopping experience.
                    </p>
                </div>

                {/* Authentication Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">

                    {/* Heading */}
                    <div className="mb-7">
                        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
                            {isRegister ? "Create your account" : "Welcome back"}
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {isRegister
                                ? "Create an account to get started."
                                : "Enter your details to access your account."}
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="mb-7 grid grid-cols-2 rounded-xl bg-secondary p-1">
                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            aria-pressed={!isRegister}
                            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${!isRegister
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Login
                        </button>

                        <button
                            type="button"
                            onClick={() => switchMode("register")}
                            aria-pressed={isRegister}
                            className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${isRegister
                                    ? "bg-card text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name Fields - Registration Only */}
                        {isRegister && (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="firstName"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        First name
                                    </label>

                                    <input
                                        id="firstName"
                                        name="firstName"
                                        type="text"
                                        autoComplete="given-name"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="lastName"
                                        className="mb-2 block text-sm font-medium text-foreground"
                                    >
                                        Last name
                                    </label>

                                    <input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        autoComplete="family-name"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-foreground"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-foreground"
                                >
                                    Password
                                </label>

                                {!isRegister && (
                                    <span className="text-xs text-muted-foreground">
                                        Enter your password
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={
                                        isRegister ? "new-password" : "current-password"
                                    }
                                    placeholder={
                                        isRegister
                                            ? "At least 8 characters"
                                            : "Enter your password"
                                    }
                                    value={formData.password}
                                    onChange={handleChange}
                                    minLength={isRegister ? 8 : undefined}
                                    required
                                    className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-20 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((previous) => !previous)
                                    }
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground transition hover:text-primary"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>

                            {isRegister && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Password must contain at least 8 characters.
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Please wait..."
                                : isRegister
                                    ? "Create Account"
                                    : "Login"}
                        </button>
                    </form>

                    {/* Switch Mode */}
                    <p className="mt-7 text-center text-sm text-muted-foreground">
                        {isRegister
                            ? "Already have an account?"
                            : "Don't have an account?"}

                        {" "}

                        <button
                            type="button"
                            onClick={() =>
                                switchMode(isRegister ? "login" : "register")
                            }
                            className="font-semibold text-primary transition hover:text-primary-hover"
                        >
                            {isRegister ? "Login" : "Create account"}
                        </button>
                    </p>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Goayo. All rights reserved.
                </p>
            </div>
        </main>
    );
}
