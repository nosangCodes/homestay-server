import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { client } from "../db/client";

export default async function isRegisteredValidate(
  req: Request<{}, {}, User>,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, phone } = req.body;

    const isEmailRegistered = await client.user.findUnique({
      where: {
        email,
      },
    });
    if (isEmailRegistered) {
      return res.status(400).json({ message: "user with email already exist" });
    }

    if (!phone) {
      return next();
    }
    const isPhoneRegistered = await client.user.findUnique({
      where: {
        phone,
      },
    });
    if (isPhoneRegistered) {
      return res.status(400).json({ message: "user with phone already exist" });
    }
    next();
  } catch (error) {
    console.error("🚀 ~ isRegisteredValidate error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
