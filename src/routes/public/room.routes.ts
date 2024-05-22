import { Router } from "express";
import { roomController } from "../../controller";
import validate from "../../middlewares/validate";
import { roomValidation } from "../../validations";

const router = Router();

router
  .get("/", roomController.get)
  .get("/:id", validate(roomValidation.roomId), roomController.getRoomById);

export default router;
