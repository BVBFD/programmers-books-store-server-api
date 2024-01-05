import { Router } from "express";
import { addLike, removeLike } from "../controllers/likesController.js";
const router = Router();

router.post("/:id", addLike);

router.delete("/:id", removeLike);

export default router;
