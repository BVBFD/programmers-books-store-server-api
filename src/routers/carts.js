import { Router } from "express";
import {
  addCartItem,
  getItemsOrSelectedItemsFromCart,
  removeCartItem,
} from "../controllers/cartsController.js";
const router = Router();

// 장바구니 담기
router.post("/", addCartItem);

// 장바구니 조회 or 장바구니에서 선택한 도서 목록 조회
router.get("/", getItemsOrSelectedItemsFromCart);

// 장바구니 도서 삭제
router.delete("/:id", removeCartItem);

export default router;
