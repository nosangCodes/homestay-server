import { NextFunction, Request, Response } from "express";
import { verifyjwtToken } from "../utils/jwt-helper";
import { JwtPayload } from "jsonwebtoken";

// Extend the Request interface to include decodedToken property
declare global {
  namespace Express {
    interface Request {
      decodedToken?: JwtPayload;
    }
  }
}

const isAuthorized = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.homestay_token;
    if (token) {
      await verifyjwtToken(token as string)
        .then((decoded) => {
          req.decodedToken = decoded as JwtPayload;
          next();
        })
        .catch((err) => {
          console.log("[TOKEN VERIFICATION FAILED]", err);
          return res.status(403).json({ message: "Unauthorized" });
        }); // Object.assign(req, { user: result });
    } else {
      return res.sendStatus(401);
    }
  } catch (error) {
    console.error("[ERROR_VERFIFYING_TOKEN]", error);
    res.status(500).json({ message: "INternal server error" });
  }
};

export default isAuthorized;
