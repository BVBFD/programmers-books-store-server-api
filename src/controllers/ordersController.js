import conn from "../utils/mariadb.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";

const handleOrderQuery = async (sql, params, res, next, status) => {
  let connection;

  try {
    connection = conn();
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    return next({
      status: status.fail,
      message: error.message,
    });
  } finally {
    connection.releaseConnection(connection);
  }
};

const handleGetRecentInsertQuery = async (sql, next, status) => {
  let connection;

  try {
    connection = conn();
    const [results] = await connection.query(sql);
    return results;
  } catch (error) {
    return next({
      status: status.fail,
      message: error.message,
    });
  } finally {
    connection.releaseConnection(connection);
  }
};

const handleOrders = async (req, res, next) => {
  const { _id: userId } = req.decoded.payload;
  const { items, delivery, firstBookTitle, totalQuantity, totalPrice } =
    req.body;
  const { address, receiver, contact } = delivery;
  const status = {
    success: StatusCodes.CREATED,
    fail: StatusCodes.BAD_REQUEST,
  };

  // delivery 테이블 배송정보 입력
  let sql =
    "INSERT INTO delivery (_id, address, receiver, contact) VALUES (?, ?, ?, ?)";
  let params = [uuidv4(), address, receiver, contact];
  let results;

  results = await handleOrderQuery(sql, params, res, next, status);
  sql = "SELECT * FROM delivery ORDER BY delivery.created_at DESC LIMIT 1";
  [results] = await handleGetRecentInsertQuery(sql, next, status);
  // delivery 테이블 배송정보 입력

  // 주문 정보 입력
  sql =
    "INSERT INTO orders (_id, users_id, delivery_id, books_title, total_quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)";
  params = [
    uuidv4(),
    userId,
    `${results._id}`,
    firstBookTitle,
    totalQuantity,
    totalPrice,
  ];

  results = await handleOrderQuery(sql, params, res, next, status);
  sql = "SELECT * FROM orders ORDER BY orders.created_at DESC LIMIT 1";
  [results] = await handleGetRecentInsertQuery(sql, next, status);
  // 주문 정보 입력

  // 주문 상세 목록 입력
  items.forEach(async (item) => {
    sql =
      "INSERT INTO ordered_book (_id, orders_id, books_id, quantity) VALUES (?, ?, ?, ?)";
    params = [uuidv4(), `${results._id}`, `${item.books_id}`, item.quantity];
    await handleOrderQuery(sql, params, res, next, status);
  });
  // 주문 상세 목록 입력

  // 결제된 도서 장바구니 삭제
  sql =
    "DELETE FROM Bookshop.cart_items WHERE books_id IN (?, ?) AND quantity IN (?, ?) AND users_id = ?";
  params = items.map((item) => item.books_id);
  items.forEach((item) => {
    params.push(item.quantity);
  });
  params.push(userId);
  await handleOrderQuery(sql, params, res, next, status);
  // 결제된 도서 장바구니 삭제

  // 주문 내역 조회
  sql = `SELECT orders._id, orders.users_id, books_title, total_quantity, total_price, orders.created_at, address, receiver, contact
      FROM orders LEFT JOIN delivery 
      ON orders.delivery_id = delivery._id
      WHERE orders.users_id = ?
      ORDER BY orders.created_at DESC;`;
  params = [userId];
  results = await handleOrderQuery(sql, params, res, next, status);
  // 주문 내역 조회

  return res.status(StatusCodes.OK).json(results);
};

const handleGetOrderDetails = async (req, res, next) => {
  const { id } = req.params;
  const status = {
    success: StatusCodes.OK,
    fail: StatusCodes.BAD_REQUEST,
  };
  // 주문 상세 상품 조회
  const sql = `SELECT books_id, title, author, price, quantity
      FROM ordered_book LEFT JOIN books 
      ON ordered_book.books_id = books._id
      WHERE ordered_book.orders_id = ?
      ORDER BY ordered_book.created_at DESC`;
  const params = [id];
  const results = await handleOrderQuery(sql, params, res, next, status);
  // 주문 상세 상품 조회
  return res.status(status.success).json(results);
};

export { handleOrders, handleGetOrderDetails };
