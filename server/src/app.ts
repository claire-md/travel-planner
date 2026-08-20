import "dotenv/config";
import express, { type Express, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB, disconnectDB } from "./db/prisma.ts";
import authRoutes from "./routes/authRoutes.ts";
import tripRoutes from "./routes/tripRoutes.ts";

// Connect to DB
connectDB();

const app: Express = express();

// Middleware
app.use(
  cors({
    origin:
      process.env.ENVIRONMENT === "development"
        ? process.env.DEV_CLIENT_URL
        : process.env.PROD_CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Home");
});

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Disconnect from DB
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received. Closing server...");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
