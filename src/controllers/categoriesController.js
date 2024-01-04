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

const addNewCategory = async (req, res, next) => {
  const { category } = req.body;
  const uniqueId = uuidv4();
  const sql = "INSERT INTO categories (_id, category) VALUES (?, ?)";

  await handleQuery(sql, [uniqueId, category], res, next);
};

const getAllCategory = async (req, res, next) => {
  const sql = "SELECT * FROM categories";

  await handleQuery(sql, [], res, next);
};

export { addNewCategory, getAllCategory };
