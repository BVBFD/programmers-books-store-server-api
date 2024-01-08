import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const handleQuery = async (sql, params, res, next, status) => {
  let connection;

  try {
    connection = conn();
    const [results] = await connection.query(sql, params);
    return res.status(status.success).json(results);
  } catch (error) {
    return next({
      status: status.fail,
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

  let sql =
    "SELECT *, (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes FROM books";
  const params = [];
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

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

  await handleQuery(sql, params, res, next, status);
};

const getIndividualBook = async (req, res, next) => {
  const { users_id } = req.body;
  const { id } = req.params;
  const sql = `SELECT *, 
                  (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes,
                  (SELECT EXISTS (SELECT * FROM user_likes_table WHERE user_likes_table.users_id = ? AND user_likes_table.books_id = ?)) AS liked 
              FROM books LEFT JOIN categories 
              ON books.category_id = categories.category_id 
              WHERE books._id = ?`;
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  await handleQuery(sql, [users_id, id, id], res, next, status);
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
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

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
    next,
    status
  );
};

export { getAllBookAndByCategory, getIndividualBook, addBook };
