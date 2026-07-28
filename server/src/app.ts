import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import corsConfig from "./config/corsConfig";
import healthRouter from "./routes/health.routes";


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

export default app;
