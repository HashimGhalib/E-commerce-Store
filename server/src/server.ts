import app from "./app";
import env from "./config/env"
import connectDB from "./config/db";

(async () => {
    await connectDB();
})()

const { PORT } = env()


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

