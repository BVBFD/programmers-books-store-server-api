import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";

const verifyToken = (req, res, next) => {
  const token = req.headers.token;

  try {
    if (token) {
      const decoded = jwt.verify(`${token}`, `${process.env.JWT_PRIVATE_KEY}`, {
        complete: true,
      });
      req.decoded = decoded;
    } else {
      req.decoded = "token not found!";
    }

    next();
  } catch (error) {
    if (
      // 둘 중에 하나를 써도 잘 동작함
      error.message === "jwt expired" &&
      error instanceof jwt.TokenExpiredError
    ) {
      return next({
        status: StatusCodes.UNAUTHORIZED,
        message: `${error.message} 로그린 세션이 만료되었습니다! 다시 로그인 해주세요!!`,
      });
    }

    if (error && error instanceof jwt.JsonWebTokenError) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: `${error.message} 유효하지 않은 토큰 입니다! 다시 로그인 해주세요!!`,
      });
    }
  }
};

export default verifyToken;
