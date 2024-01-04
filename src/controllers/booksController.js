import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const handleQuery = async (sql, params, res, next) => {
  let connection;

  try {
    connection = conn();
    const [results] = await connection.query(sql, params);
    return res.status(StatusCodes.OK).json(results);
  } catch (error) {
    return next({
      status: StatusCodes.BAD_REQUEST,
      message: error.message,
    });
  } finally {
    connection.releaseConnection(connection);
  }
};

const getAllBookAndByCategory = async (req, res, next) => {
  const { categoryId, news, limit, currentPage } = req.query;
  const parsedIntLimit = parseInt(limit);
  const offset = parsedIntLimit * (parseInt(currentPage) - 1);

  let sql = "SELECT * FROM books";
  const params = [];

  if (news || categoryId) {
    sql += " WHERE";

    if (news && !categoryId) {
      sql += " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    }

    if (categoryId && !news) {
      sql += " category_id = ?";
      params.push(categoryId);
    }

    if (categoryId && news) {
      sql +=
        " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND category_id = ?";
      params.push(categoryId);
    }
  }

  sql += " LIMIT ? OFFSET ?";
  params.push(parsedIntLimit, offset);

  await handleQuery(sql, params, res, next);
};

const getIndividualBook = async (req, res, next) => {
  const { id } = req.params;
  const sql =
    "SELECT books._id, title, category, form, isbn, img, summary, detail, author, pages, contents, price, likes, pub_date, books.updated_at, books.created_at FROM books LEFT JOIN categories ON books.category_id = categories._id WHERE books._id = ?";
  await handleQuery(sql, [id], res, next);
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

  await handleQuery(
    sql,
    [
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
    ],
    res,
    next
  );
};

export { getAllBookAndByCategory, getIndividualBook, addBook };
