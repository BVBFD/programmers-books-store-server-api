import { Router } from "express";
import {
  getAllBookAndByCategory,
  getIndividualBook,
} from "../controllers/booksController.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

// 전체 도서 조회, 카테고리별 전체 도서 조회
router.get("/", getAllBookAndByCategory);

// 개별 도서 조회
// router.get("/:id", verifyToken, getIndividualBook);
router.get("/:id", getIndividualBook);

export default router;
