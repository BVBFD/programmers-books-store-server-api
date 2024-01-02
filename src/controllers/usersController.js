import conn from "../utils/mariadb.js";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const signUp = async (req, res, next) => {
  const { email, password } = req.body;
  const cryptedPwd = CryptoJS.AES.encrypt(
    `${password}`,
    `${process.env.CryptoJS_Secret_Key}`
  ).toString();
  const uniqueId = uuidv4();
  const sql = "INSERT INTO users (_id, email, password) VALUES (?, ?, ?)";

  // 서버 접속 시도
  try {
    // sql 구문 검사
    try {
      const results = await conn().query(sql, [uniqueId, email, cryptedPwd]);
      return res.status(StatusCodes.CREATED).json(results);
      // sql 구문 에러 오류
    } catch (error) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
    // 서버 접속 오류
  } catch (error) {
    return next({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
    // 메모리에 저장된 접속 객체를 끊어줘야함
  } finally {
    return conn().releaseConnection();
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";

  // 서버 접속 시도
  try {
    // sql 구문 검사
    try {
      const [[results]] = await conn().query(sql, [email]);

      //   유저 정보가 없을 때
      if (!results) {
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Not Found User",
        });
      } else {
        // 유저 비밀번호 검사
        const foundUser = results;
        // 비밀번호 복호화
        const decryptedPwd = CryptoJS.AES.decrypt(
          `${foundUser.password}`,
          `${process.env.CryptoJS_Secret_Key}`
        ).toString(CryptoJS.enc.Utf8);

        // 원본 비밀번화 복호화된 비밀번호 비교
        if (decryptedPwd === password.toString()) {
          // 로그인 성공
          const { _id, email, created_at, updated_at } = foundUser;
          // 토큰 발행
          const token = jwt.sign(
            {
              _id,
              email,
              created_at,
              updated_at,
            },
            `${process.env.JWT_PRIVATE_KEY}`,
            { expiresIn: "24h", issuer: "Lee Seong Eun" }
          );
          res.cookie("token", token, {
            // 쿠키유효기간, 3.6e6은 1시간을 ms초로 나타낸거임
            maxAge: 3.6e6 * 24,
            // 클라이언트측 자바스크립트로 접근불가
            httpOnly: true,
            // crossSite 요청에서도 쿠키가 전송되도록 허용
            sameSite: "none",
            // true로 설정하게 되면 HTTPS 프로토콜로만 전송
            // 지금 dev 환경이기 때문에 false로 설정하고 개발
            secure: false,
          });
          return res
            .status(StatusCodes.OK)
            .json({ _id, email, created_at, updated_at });
        } else {
          // 비밀번호 불일치
          return next({
            status: StatusCodes.UNAUTHORIZED,
            message: "Invalid Password",
          });
        }
      }
      // sql 구문 에러 오류
    } catch (error) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
    // 서버 접속 오류
  } catch (error) {
    return next({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  } finally {
    // 메모리에 저장된 접속 객체를 끊어줘야함
    return conn().releaseConnection();
  }
};

const passwordResetRequest = (req, res, next) => {
  res.json("비밀번호 초기화 요청");
};

const passwordReset = (req, res, next) => {
  res.json("비밀번호 초기화");
};

export { signUp, login, passwordResetRequest, passwordReset };
