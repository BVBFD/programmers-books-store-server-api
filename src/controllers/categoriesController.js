import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const addNewCategory = async (req, res, next) => {
  const { category } = req.body;
  const uniqueId = uuidv4();
  const sql = "INSERT INTO categories (_id, category) VALUES (?, ?)";
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const results = await connection.query(sql, [uniqueId, category]);
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
    return connection.releaseConnection(connection);
  }
};

const getAllCategory = async (req, res, next) => {
  let connection;
  let sql = "SELECT * FROM categories";

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const [results] = await connection.query(sql);
      return res.status(StatusCodes.OK).json(results);
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
    return connection.releaseConnection(connection);
  }
};

export { addNewCategory, getAllCategory };
