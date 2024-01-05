import conn from "../utils/mariadb.js";
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

const addLike = async (req, res, next) => {
  const { users_id } = req.body;
  const { id } = req.params;

  let sql = "INSERT INTO user_likes_table (users_id, books_id) VALUE (?, ?)";
  const params = [users_id, id];

  await handleQuery(sql, params, res, next);
};

const removeLike = async (req, res, next) => {
  const { users_id } = req.body;
  const { id } = req.params;

  let sql = "DELETE FROM user_likes_table WHERE users_id = ? AND books_id = ?";
  const params = [users_id, id];

  await handleQuery(sql, params, res, next);
};

export { addLike, removeLike };
