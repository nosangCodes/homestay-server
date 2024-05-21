import { NextFunction, Request, Response } from "express";

const handleAsync =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log("handleasync");
      return next(err);
    });
  };

export default handleAsync;
