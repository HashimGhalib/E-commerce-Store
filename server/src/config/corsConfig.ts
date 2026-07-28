require("dotenv").config();
const cors = require("cors");
import type { CorsOptions } from "cors";

type StaticOrigin = boolean | string | RegExp | Array<boolean | string | RegExp>;

type CustomOrigin = (
    requestOrigin: string | undefined,
    callback: (err: Error | null, origin?: StaticOrigin) => void,
) => void;


const allowedOrigins: string[] = [
    process.env.CLIENT_URL!,
    "https://yourdomain.com",
];

const handleOrigin: CustomOrigin = (requestOrigin, callback) => {
    // requestOrigin is undefined for same-origin or non-browser requests (e.g. Postman, cURL)
    if (!requestOrigin || allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
    } else {
        callback(new Error("Not allowed by CORS"), false);
    }
};

const corsOptions: CorsOptions = {
    origin: handleOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
    exposedHeaders: ["Content-Length", "Content-Range"],
    optionsSuccessStatus: 204,
    preflightContinue: false,
    maxAge: 600, //Maximum time in seconds the browser should cache the results of a preflight request

};

//Allow requests from different origins (domains, protocols, ports) to access the server.
const corsConfig = () => cors(corsOptions);

export default corsConfig;
