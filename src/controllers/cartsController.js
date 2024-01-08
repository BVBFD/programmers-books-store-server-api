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

const addCartItem = async (req, res, next) => {
  const { users_id, books_id, quantity } = req.body;

  const uniqueId = uuidv4();
  const params = [uniqueId, users_id, books_id, quantity];
  const sql =
    "INSERT INTO Bookshop.cart_items (cart_items_id, users_id, books_id, quantity) VALUES (?, ?, ?, ?)";

  await handleQuery(sql, params, res, next);
};

const getItemsOrSelectedItemsFromCart = async (req, res, next) => {
  const { users_id, selected } = req.body;
  let params;
  let sql;

  if (selected) {
    params = [users_id, selected];
    sql =
      "SELECT cart_items_id, books._id, title, summary, quantity, price FROM cart_items LEFT JOIN books ON cart_items.books_id = books._id WHERE users_id = ? AND cart_items_id IN (?)";
  } else {
    params = [users_id];
    sql =
      "SELECT cart_items_id, books._id, title, summary, quantity, price FROM cart_items LEFT JOIN books ON cart_items.books_id = books._id WHERE users_id = ? AND cart_items_id";
  }

  await handleQuery(sql, params, res, next);
};

const removeCartItem = async (req, res, next) => {
  const { id: books_id } = req.params;
  const { users_id } = req.body;
  const params = [books_id, users_id];
  const sql = "DELETE FROM cart_items WHERE books_id = ? AND users_id = ?";

  await handleQuery(sql, params, res, next);
};

export { addCartItem, removeCartItem, getItemsOrSelectedItemsFromCart };
