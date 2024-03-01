import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  handleGetOrderDetail,
  handleGetOrders,
  handleOrders,
} from "../controllers/ordersController.js";
const router = Router();

// 주문하기
router.post("/", verifyToken, handleOrders);

// 주문 조회
router.get("/", verifyToken, handleGetOrders);

// 개별 주문 주회
router.get("/:id", verifyToken, handleGetOrderDetail);

export default router;
