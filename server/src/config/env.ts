require("dotenv").config();

function requireEnv(name: string): string {
    const value = process.env[name];

    if (!value || value.trim() === "") {
        console.error(`Environment variable "${name}" is not set.`);
        process.exit(1);
    }

    return value;
}

const env = () => <{
    NODE_ENV: string;
    PORT: number;
    MONGO_URI: string;
    CLIENT_URL: string;
}>({
    NODE_ENV: process.env.NODE_ENV ?? "development",

    PORT: Number(process.env.PORT ?? 5000),

    MONGO_URI: requireEnv("MONGODB_URI"),

    CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
});

export default env;

