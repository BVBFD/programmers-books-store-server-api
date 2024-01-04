import { Router } from "express";
import {
  addBook,
  getAllBookAndByCategory,
  getIndividualBook,
} from "../controllers/booksController.js";

const router = Router();

// 전체 도서 조회, 카테고리별 전체 도서 조회
router.get("/", getAllBookAndByCategory);

// 개별 도서 조회
router.get("/:id", getIndividualBook);

// 개별 도서 추가
router.post("/", addBook);

export default router;
