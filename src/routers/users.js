import { Router } from "express";
import {
  login,
  passwordResetRequest,
  passwordReset,
  signUp,
} from "../controllers/usersController.js";

const router = Router();

// 회원가입
router.post("/sign-up", signUp);

// 로그인
router.post("/login", login);

// 비밀번호 초기화 요청
router.post("/reset", passwordResetRequest);

// 비밀번호 초기화
router.put("/reset", passwordReset);

export default router;
