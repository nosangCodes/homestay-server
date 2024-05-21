import { Request, Response } from "express";
import { userService } from "../service/index";
import handleAsync from "../utils/handleAsync";
import { User } from "@prisma/client";
import { hashPassword, verifyPassword } from "../utils/password-helper";
import { generateToken } from "../utils/jwt-helper";

const getAll = handleAsync(async (_: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ data: users });
  } catch (error) {
    console.log("error fetching user", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const create = handleAsync(
  async (req: Request<{}, {}, User>, res: Response) => {
    try {
      const { password } = req.body;
      const hashedPassword = await hashPassword(password);
      Object.assign(req.body, { password: hashedPassword });
      const newUser = await userService.create(req.body);
      const token = generateToken(newUser.email, newUser.id);
      res.json({ message: "user created", token });
    } catch (error) {
      console.log("controller error creating user", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const login = handleAsync(
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response
  ) => {
    try {
      const { email, password } = req.body;
      const user = await userService.findByEmail(email);
      if (!user) {
        return res.status(400).json({ error: "user with email not found" });
      }
      const verified = await verifyPassword(password, user.password);
      if (!verified) {
        return res.status(400).json({ error: "password does not match" });
      }
      const token = generateToken(email, user.id);
      res
        .cookie("homestay_token", token, { maxAge: 14400000 })
        .json({ message: "user logged in", token });
    } catch (error) {
      console.log("error signing in", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

const me = handleAsync(async (req: Request, res: Response) => {
  try {
    const user = await userService.findById(req.decodedToken?.userId);
    if (!user) {
      res.status(400).json({ message: "user not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export { getAll, create, login, me };
