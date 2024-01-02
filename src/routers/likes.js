import { Router } from "express";
const router = Router();

// 좋아요 추가
router.post("/:id", (req, res, next) => {
  res.json("좋아요 추가");
});

// 좋아요 삭제
router.post("/:id", (req, res, next) => {
  res.json("좋아요 삭제");
});

export default router;
