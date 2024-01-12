import { Router } from "express";
import { addLike, removeLike } from "../controllers/likesController.js";
import verifyToken from "../middlewares/verifyToken.js";
const router = Router();

router.post("/:id", verifyToken, addLike);

router.delete("/:id", verifyToken, removeLike);

export default router;
