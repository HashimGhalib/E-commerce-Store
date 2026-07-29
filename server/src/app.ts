import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import morgan from "morgan";
import corsConfig from "./config/corsConfig";
import healthRouter from "./routes/health.routes";
import productRoutes from "./routes/product.routes";
import categoryRoutes from "./routes/category.routes";
import { ApiError } from "./utils/ApiError";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();


//Adds secure HTTP headers (for example, X-Content-Type-Options, X-Frame-Options) to improve application security.
app.use(helmet());

//Enable CORS requests
app.use(corsConfig());

//Logs incoming HTTP requests, making development and debugging easier.
app.use(morgan("dev"));

//body parser
app.use(express.json()); // Parses JSON request bodies.
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data.



app.use("/api/v1", healthRouter);


// Register API Endpoints
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// 1. Unmatched Route Handler (404)
app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Route not found`));
});

// 2. Centralized Global Error Middleware (Must be registered LAST)
app.use(errorHandler);

export default app;
