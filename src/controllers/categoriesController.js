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
    const errorMessage = error.message || "Unknown error occurred";
    console.error(`Error in handleQuery: ${errorMessage}`);
    return next({
      status: status.fail,
      message: errorMessage,
    });
  } finally {
    if (connection) {
      connection.releaseConnection(connection);
    }
  }
};

const addNewCategory = async (req, res, next) => {
  const { category } = req.body;
  const uniqueId = uuidv4();
  const sql = "INSERT INTO categories (category_id, category) VALUES (?, ?)";
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

  await handleQuery(sql, [uniqueId, category], res, next, status);
};

const getAllCategory = async (req, res, next) => {
  const sql = "SELECT * FROM categories";
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  await handleQuery(sql, [], res, next, status);
};

export { addNewCategory, getAllCategory };
