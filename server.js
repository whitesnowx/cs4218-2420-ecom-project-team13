import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import { connectDB, disconnectDB } from "./config/db.js";
import authRoutes from './routes/authRoute.js'
import categoryRoutes from './routes/categoryRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cors from "cors";

// configure env
dotenv.config();

//database config
connectDB();

const app = express();

//middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/product", productRoutes);

// rest api

app.get('/', (req,res) => {
    res.send("<h1>Welcome to ecommerce app</h1>");
});

const PORT = process.env.PORT || 6060;

const server = app.listen(PORT, () => {
    console.log(`Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white);
});

const cleanup = async () => {
    server.close(async () => {
        console.log("HTTP server closed");
        await disconnectDB();
        process.exit(0); // Exit gracefully
    });    
}

// Handle shutdown signals
process.on("SIGINT", async () => {
    console.log("SIGINT signal received: closing HTTP server");
    await cleanup();
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM signal received: closing HTTP server");
    await cleanup();
});


export default app;