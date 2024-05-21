import Joi from "joi";
import { validatePassword } from "./custom.validation";

const signupSchema = {
  body: Joi.object().keys({
    firstName: Joi.string().min(1).max(50).required(),
    lastName: Joi.string().min(1).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
      .length(10)
      .pattern(/^[0-9]+$/)
      .required(),
    password: Joi.custom(validatePassword, "validate password").required(),
    userType: Joi.valid("ADMIN", "USER").default("ADMIN"),
  }),
};

const signinSchema = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};
export { signupSchema, signinSchema };
