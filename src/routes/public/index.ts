import { Router } from "express";
import roomRoutes from "./room.routes";

const router = Router();

router.use("/room", roomRoutes);

export default router;
