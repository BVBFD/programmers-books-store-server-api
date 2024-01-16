import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const handleQuery = async (sql, params, res, next, status) => {
  let connection;

  try {
    connection = conn();
    const [results] = await connection.query(sql, params);

    if (
      sql.includes(
        "SELECT *, (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes FROM books"
      ) ||
      sql.includes("SELECT count(*) as totalBooksCount from books")
    ) {
      return results;
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

const getAllBookAndByCategory = async (req, res, next) => {
  const { categoryId, news, limit, currentPage } = req.query;
  const parsedIntLimit = parseInt(limit);
  const offset = parsedIntLimit * (parseInt(currentPage) - 1);

  let sql =
    "SELECT *, (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes FROM books";
  let params = [];

  let sqlCount = "SELECT count(*) as totalBooksCount from books";
  let paramsCount = [];

  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  if (news || categoryId) {
    sql += " WHERE";
    sqlCount += " WHERE";

    if (news && !categoryId) {
      sql += " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
      sqlCount +=
        " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    }

    if (categoryId && !news) {
      sql += " category_id = ?";
      sqlCount += " category_id = ?";
      params.push(categoryId);
      paramsCount.push(categoryId);
    }

    if (categoryId && news) {
      sql +=
        " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND category_id = ?";
      sqlCount +=
        " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND category_id = ?";
      params.push(categoryId);
      paramsCount.push(categoryId);
    }
  }

  sql += " LIMIT ? OFFSET ?";
  params.push(parsedIntLimit, offset);

  let books = await handleQuery(sql, params, res, next, status);
  books = books.map(
    ({ category_id, pub_date, updated_at, created_at, ...book }) => ({
      ...book,
      categoryId: category_id,
      pubDate: pub_date,
      updatedAt: updated_at,
      createdAt: created_at,
    })
  );

  const [{ totalBooksCount }] = await handleQuery(
    sqlCount,
    paramsCount,
    res,
    next,
    status
  );

  return res.status(status.success).json({
    books,
    pagination: {
      currentPage: parseInt(currentPage),
      totalBooksCount,
    },
  });
};

const getIndividualBook = async (req, res, next) => {
  const { id } = req.params;
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  const commonPartOfQuery = `FROM books LEFT JOIN categories 
    ON books.category_id = categories.category_id 
    WHERE books._id = ?`;

  let sql = `SELECT *, 
    (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes`;

  if (req.decoded !== "token not found!") {
    // 로그인 상태이면 => liked 추가
    const { _id: users_id } = req.decoded.payload;
    sql += `,
      (SELECT EXISTS (SELECT * FROM user_likes_table WHERE user_likes_table.users_id = ? AND user_likes_table.books_id = ?)) AS liked`;

    await handleQuery(
      sql + ` ${commonPartOfQuery}`,
      [users_id, id, id],
      res,
      next,
      status
    );
  } else {
    // 로그인 상태가 아니면 => liked 빼고
    await handleQuery(sql + ` ${commonPartOfQuery}`, [id], res, next, status);
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
