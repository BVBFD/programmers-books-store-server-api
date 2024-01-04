import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const getAllBookAndByCategory = async (req, res, next) => {
  const { categoryId, news, limit, currentPage } = req.query;
  let connection;
  let sql;
  let offset;

  try {
    connection = conn();

    if (categoryId && !news) {
      sql = "SELECT * FROM books WHERE category_id = ? LIMIT ? OFFSET ?";
      const parsedIntLimit = parseInt(limit);
      offset = parsedIntLimit * (parseInt(currentPage) - 1);
      try {
        // sql 구문 검사
        const [results] = await connection.query(sql, [
          categoryId,
          parsedIntLimit,
          offset,
        ]);
        return res.status(StatusCodes.OK).json(results);
        // sql 구문 에러 오류
      } catch (error) {
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: error.message,
        });
      }
    } else if (!categoryId && news) {
      sql =
        "SELECT * FROM books WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() LIMIT ? OFFSET ?";
      const parsedIntLimit = parseInt(limit);
      offset = parsedIntLimit * (parseInt(currentPage) - 1);
      try {
        // sql 구문 검사
        const [results] = await connection.query(sql, [parsedIntLimit, offset]);
        return res.status(StatusCodes.OK).json(results);
        // sql 구문 에러 오류
      } catch (error) {
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: error.message,
        });
      }
    } else if (categoryId && news) {
      sql =
        "SELECT * FROM books WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND books.category_id=? LIMIT ? OFFSET ?";
      const parsedIntLimit = parseInt(limit);
      offset = parsedIntLimit * (parseInt(currentPage) - 1);
      try {
        // sql 구문 검사
        const [results] = await connection.query(sql, [
          categoryId,
          parsedIntLimit,
          offset,
        ]);
        return res.status(StatusCodes.OK).json(results);
        // sql 구문 에러 오류
      } catch (error) {
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: error.message,
        });
      }
    } else {
      sql = "SELECT * FROM books LIMIT ? OFFSET ?";
      const parsedIntLimit = parseInt(limit);
      offset = parsedIntLimit * (parseInt(currentPage) - 1);
      try {
        // sql 구문 검사
        const [results] = await connection.query(sql, [parsedIntLimit, offset]);
        return res.status(StatusCodes.OK).json(results);
        // sql 구문 에러 오류
      } catch (error) {
        return next({
          status: StatusCodes.BAD_REQUEST,
          message: error.message,
        });
      }
    }
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

const getIndividualBook = async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT books._id, title, category, form, isbn, img, summary, detail, author, pages, contents, price, likes, pub_date, books.updated_at, books.created_at FROM books LEFT JOIN categories ON books.category_id = categories._id WHERE books._id = ?";
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const [[results]] = await connection.query(sql, [id]);
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

const addBook = async (req, res, next) => {
  const {
    title,
    form,
    isbn,
    img,
    summary,
    detail,
    author,
    pages,
    contents,
    price,
    pub_date,
  } = req.body;
  const uniqueId = uuidv4();
  const sql =
    "INSERT INTO books (_id, title, form, isbn, img, summary, detail, author, pages, contents, price, pub_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  let connection;

  try {
    // 서버 접속 시도
    connection = conn();
    try {
      // sql 구문 검사
      const results = await connection.query(sql, [
        uniqueId,
        title,
        form,
        isbn,
        img,
        summary,
        detail,
        author,
        pages,
        contents,
        price,
        pub_date,
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
    return connection.releaseConnection(connection);
  }
};

export { getAllBookAndByCategory, getIndividualBook, addBook };
