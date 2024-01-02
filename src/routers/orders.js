import { Router } from "express";
const router = Router();

// 주문하기
router.post("/", (req, res, next) => {
  res.json("주문하기");
});

// 주문 목록 조회
router.get("/", (req, res, next) => {
  res.json("주문 목록 조회");
});

// 주문 상세 상품 조회
router.get("/:id", (req, res, next) => {
  res.json("주문 상세 상품 조회");
});

export default router;
