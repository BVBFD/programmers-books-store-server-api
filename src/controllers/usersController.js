import conn from "../utils/mariadb.js";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";

const handleQuery = async (sql, params, res, next, status, callback) => {
  let connection;
  let results;

  try {
    connection = conn();

    if (
      sql ===
      "INSERT INTO users (_id, email, password, salt) VALUES (?, ?, ?, ?)"
    ) {
      [results] = await connection.query(sql, params);
    } else {
      [[results]] = await connection.query(sql, params);
    }

    if (callback) {
      callback(results);
    } else {
      return res.status(status.success).json(results);
    }
  } catch (error) {
    return next({
      status: status.fail,
      message: error.message,
    });
  } finally {
    connection.releaseConnection(connection);
  }
};

const signUp = async (req, res, next) => {
  const { email, password } = req.body;

  const salt = crypto.randomBytes(10).toString("base64");
  const cryptedPwd = crypto
    .pbkdf2Sync(`${password}`, salt, 10000, 10, "sha512")
    .toString("base64");

  const uniqueId = uuidv4();
  const sql =
    "INSERT INTO users (_id, email, password, salt) VALUES (?, ?, ?, ?)";
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

  await handleQuery(
    sql,
    [uniqueId, email, cryptedPwd, salt],
    res,
    next,
    status
  );
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ?";
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  const handleLogin = async (results) => {
    if (!results) {
      return next({
        status: StatusCodes.NOT_FOUND,
        message: "Not Found User",
      });
    } else {
      const foundUser = results;
      const decryptedPwd = crypto
        .pbkdf2Sync(`${password}`, foundUser.salt, 10000, 10, "sha512")
        .toString("base64");

      if (decryptedPwd === foundUser.password.toString()) {
        const { _id, email, created_at, updated_at } = foundUser;
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
          maxAge: 3.6e6 * 24,
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        return res
          .status(StatusCodes.OK)
          .json({ _id, email, created_at, updated_at });
      } else {
        return next({
          status: StatusCodes.UNAUTHORIZED,
          message: "Invalid Password",
        });
      }
    }
  };

  await handleQuery(sql, [email], res, next, status, handleLogin);
};

const passwordResetRequest = async (req, res, next) => {
  const { email: emailBody } = req.decoded.payload;
  const sql = "SELECT * FROM users WHERE email = ?";
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.NOT_FOUND,
  };

  await handleQuery(sql, [emailBody], res, next, status);
};

const passwordReset = async (req, res, next) => {
  const { email: emailBody } = req.decoded.payload;
  const { password: passwordBody } = req.body;
  const sql = "UPDATE users SET password=?, salt=? WHERE email = ?";
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.UNAUTHORIZED,
  };

  const salt = crypto.randomBytes(10).toString("base64");
  const cryptedPwd = crypto
    .pbkdf2Sync(passwordBody, salt, 10000, 10, "sha512")
    .toString("base64");

  await handleQuery(sql, [cryptedPwd, salt, emailBody], res, next, status);
};

export { signUp, login, passwordResetRequest, passwordReset };
