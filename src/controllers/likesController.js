import conn from "../utils/mariadb.js";
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

const addLike = async (req, res, next) => {
  const { users_id } = req.body;
  const { id } = req.params;
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

  let sql = "INSERT INTO user_likes_table (users_id, books_id) VALUE (?, ?)";
  const params = [users_id, id];

  await handleQuery(sql, params, res, next, status);
};

const removeLike = async (req, res, next) => {
  const { users_id } = req.body;
  const { id } = req.params;

  let sql = "DELETE FROM user_likes_table WHERE users_id = ? AND books_id = ?";
  const params = [users_id, id];
  const status = {
    success: StatusCodes.NO_CONTENT,
    fail: StatusCodes.NOT_FOUND,
  };

  await handleQuery(sql, params, res, next, status);
};

export { addLike, removeLike };
