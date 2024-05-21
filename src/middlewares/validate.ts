import { NextFunction, Request, Response } from "express";
import Joi, { ObjectSchema, Schema } from "joi";
import pick from "../utils/pick";

const validate =
  (schema: {
    body?: ObjectSchema<any>;
    params?: ObjectSchema<any>;
    query?: ObjectSchema<any>;
  }) =>
  (req: Request, res: Response, next: NextFunction) => {

    const validSchema = pick(schema, ["body", "params", "query"]);
    const object = pick(
      req,
      Object.keys(validSchema) as (keyof Request<{}, {}, {}, {}>)[]
    );


    const { value, error } = Joi.object(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object);

    if (error) {
      const errorMessages = error.details.map((details) => ({
        message: details.message.replace(/"/g, ""),
        key: details.context?.["label"],
      }));

      return res
        .status(400)
        .json({ message: "validation failed", errors: errorMessages });
    }
    Object.assign(req, value);
    return next();
  };

export default validate;
