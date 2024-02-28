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

const addCartItem = async (req, res, next) => {
  if (req.decoded === "token not found!")
    return next({
      status: 401,
      message: "로그인을 해주세요!",
    });

  const { _id: users_id } = req.decoded.payload;
  const { books_id, quantity } = req.body;

  const uniqueId = uuidv4();
  const params = [uniqueId, users_id, books_id, quantity];
  const sql =
    "INSERT INTO Bookshop.cart_items (cart_items_id, users_id, books_id, quantity) VALUES (?, ?, ?, ?)";
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

  await handleQuery(sql, params, res, next, status);
};

const getItemsOrSelectedItemsFromCart = async (req, res, next) => {
  const { _id: users_id } = req.decoded.payload;
  const { selected } = req.body;
  let params;
  let sql =
    "SELECT cart_items_id, books._id, title, summary, quantity, price FROM cart_items LEFT JOIN books ON cart_items.books_id = books._id WHERE users_id = ?";
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };

  if (selected) {
    params = [users_id, selected];
    sql += " AND cart_items_id IN (?)";
  } else {
    params = [users_id];
  }

  await handleQuery(sql, params, res, next, status);
};

const removeCartItem = async (req, res, next) => {
  const { _id: users_id } = req.decoded.payload;
  const { id: books_id } = req.params;
  const params = [books_id, users_id];
  const sql = "DELETE FROM cart_items WHERE books_id = ? AND users_id = ?";
  const status = {
    success: StatusCodes.NO_CONTENT,
    fail: StatusCodes.NOT_FOUND,
  };

  await handleQuery(sql, params, res, next, status);
};

export { addCartItem, removeCartItem, getItemsOrSelectedItemsFromCart };
