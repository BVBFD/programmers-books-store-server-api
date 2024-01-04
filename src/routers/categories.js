import { Router } from "express";

import {
  addNewCategory,
  getAllCategory,
} from "../controllers/categoriesController.js";

const router = Router();

// 카테고리 추가
router.post("/", addNewCategory);

// 전체 카테고리 조회
router.get("/", getAllCategory);

export default router;
