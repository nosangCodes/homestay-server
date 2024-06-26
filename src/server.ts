import * as dotenv from "dotenv";
dotenv.config();
import { json } from "body-parser";
import express, { type Express } from "express";
import cors from "cors";
import userRoutes from "./routes/user";
import roomRoutes from "./routes/room.routes";
import publicRoutes from "./routes/public";
import cookieParser from "cookie-parser";

export const createServer = (): Express => {
  const app = express();

  const allowedOrigins = [
    "http://localhost:5173",
    "https://homestay-admin-xi.vercel.app",
    "https://homestay-admin.nosang.in",
    "https://homestay.nosang.in",
    "http://localhost:3000",
  ];

  app
    .use(
      cors({
        origin: allowedOrigins,
        credentials: true,
      })
    )
    .use(json({ limit: "50mb" }))
    .use(cookieParser())
    .use("/user", userRoutes)
    .use("/room", roomRoutes)
    .use("/public", publicRoutes)
    .get("/status", (_, res) => {
      res.json({ ok: true });
    });

  return app;
};
