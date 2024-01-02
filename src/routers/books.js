import { Router } from "express";
const router = Router();

// 전체 도서 조회
router.get("/", (req, res, next) => {
  res.json("전체 도서 조회");
});

// 개별 도서 조회
router.get("/:id", (req, res, next) => {
  res.json("개별 도서 조회");
});

// 카테고리별 도서 목록 조회
router.get("/books", (req, res, next) => {
  res.json("카테고리별 도서 목록 조회");
});

export default router;
