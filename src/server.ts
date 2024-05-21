import * as dotenv from "dotenv";
dotenv.config();
import { json } from "body-parser";
import express, { type Express } from "express";
import cors from "cors";
import userRoutes from "./routes/user";
import roomRoutes from "./routes/room.routes";
import cookieParser from "cookie-parser";

export const createServer = (): Express => {
  const app = express();

  const allowedOrigins = [
    "http://localhost:5173",
    "https://homestay-admin-xi.vercel.app",
    "https://homestay-admin.nosang.in",
  ];

  app
    .use(
      cors({
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);
          if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    )
    .use(json({ limit: "50mb" }))
    .use(cookieParser())
    .use("/user", userRoutes)
    .use("/room", roomRoutes)
    .get("/status", (_, res) => {
      res.json({ ok: true });
    });

  return app;
};
