import { Router } from "express";
import verifyToken from "../middlewares/verifyToken.js";
import {
  handleGetOrderDetails,
  handleOrders,
} from "../controllers/ordersController.js";
const router = Router();

// 주문하기
router.post("/", verifyToken, handleOrders);

// 주문 상세 상품 조회
router.get("/", verifyToken, handleGetOrderDetails);

export default router;
