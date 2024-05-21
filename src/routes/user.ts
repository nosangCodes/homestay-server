import { Router } from "express";
import { userController } from "../controller";
import { userValidation } from "../validations";
import validate from "../middlewares/validate";
import isRegisteredValidate from "../middlewares/is-registered";
import isAuthorized from "../middlewares/is-authorized";

const router = Router();

router.get("/", isAuthorized, userController.getAll);
router.get("/me", isAuthorized, userController.me);
router.post(
  "/signup",
  validate(userValidation.signupSchema),
  isRegisteredValidate,
  userController.create
);
router.post(
  "/login",
  validate(userValidation.signinSchema),
  userController.login
);

export default router;
