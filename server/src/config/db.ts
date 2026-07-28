// server/src/config/db.ts
import mongoose from "mongoose";
import env from "./env";

const { MONGO_URI } = env();

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
        console.error(`Error: ${errorMessage}`);
        process.exit(1);
    }
};

export default connectDB;