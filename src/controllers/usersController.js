import conn from "../utils/mariadb.js";
import crypto from "crypto";
// CryptoJS 사용한 것은 주석처리
// 서버에서는 추천하지 않음,
// NodeJS 코어모듈 쓰는것이 보안상 훨씬 더 나음
// import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const salt = crypto.randomBytes(10).toString("base64");
  const cryptedPwd = crypto
    .pbkdf2Sync(`${password}`, salt, 10000, 10, "sha512")
    .toString("base64");

  // const cryptedPwd = CryptoJS.AES.encrypt(
  //   `${password}`,
  //   `${process.env.CryptoJS_Secret_Key}`
  // ).toString();

  const uniqueId = uuidv4();
  const sql =
    "INSERT INTO users (_id, email, password, salt) VALUES (?, ?, ?, ?)";
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const results = await connection.query(sql, [
        uniqueId,
        email,
        cryptedPwd,
        salt,
      ]);
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
    // 연결을 풀에 반환
  } finally {
    return connection.releaseConnection();
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const [[results]] = await connection.query(sql, [email]);

      //   유저 정보가 없을 때
      if (!results) {
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Not Found User",
        });
      } else {
        // 유저 비밀번호 검사, 비밀번호 복호화
        const foundUser = results;
        const decryptedPwd = crypto
          .pbkdf2Sync(`${password}`, foundUser.salt, 10000, 10, "sha512")
          .toString("base64");

        // const decryptedPwd = CryptoJS.AES.decrypt(
        //   `${foundUser.password}`,
        //   `${process.env.CryptoJS_Secret_Key}`
        // ).toString(CryptoJS.enc.Utf8);

        // 원본 비밀번화 복호화된 비밀번호 비교
        if (decryptedPwd === foundUser.password.toString()) {
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
    // 연결을 풀에 반환
    return connection.releaseConnection();
  }
};

const passwordResetRequest = async (req, res, next) => {
  const { email: emailBody } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  // 서버 접속 시도
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const [[results]] = await connection.query(sql, [emailBody]);
      const { _id, email, created_at, updated_at } = results;
      //   유저 정보가 없을 때
      if (!results) {
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Not Found User",
        });
      } else {
        return res
          .status(StatusCodes.OK)
          .json({ _id, email, created_at, updated_at });
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
    // 연결을 풀에 반환
  } finally {
    return connection.releaseConnection();
  }
};

const passwordReset = async (req, res, next) => {
  const { email: emailBody, password: passwordBody } = req.body;
  const sql = "UPDATE users SET password=?, salt=? WHERE email = ?";
  let connection;

  const salt = crypto.randomBytes(10).toString("base64");
  const cryptedPwd = crypto
    .pbkdf2Sync(passwordBody, salt, 10000, 10, "sha512")
    .toString("base64");

  // const cryptedPwd = CryptoJS.AES.encrypt(
  //   `${passwordBody}`,
  //   `${process.env.CryptoJS_Secret_Key}`
  // ).toString();

  try {
    connection = conn();

    try {
      const [results] = await connection.query(sql, [
        cryptedPwd,
        salt,
        emailBody,
      ]);

      if (results.affectedRows === 1) {
        // 업데이트 성공
        return res
          .status(StatusCodes.OK)
          .json({ success: true, message: "Password updated successfully" });
      } else {
        // 해당 이메일에 해당하는 사용자가 없음
        return next({
          status: StatusCodes.NOT_FOUND,
          message: "Not Found User",
        });
      }
    } catch (error) {
      return next({
        status: StatusCodes.BAD_REQUEST,
        message: error.message,
      });
    }
  } catch (error) {
    return next({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: error.message,
    });
  } finally {
    connection.releaseConnection();
  }
};

export { signUp, login, passwordResetRequest, passwordReset };
