import { Router } from "express";
const router = Router();

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

// 주문하기
router.post("/", async (req, res, next) => {
  const { items, delivery, firstBookTitle, totalQuantity, totalPrice, userId } =
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

  // 주문 조회
  sql = `SELECT * FROM ordered_book WHERE ordered_book.orders_id = ? ORDER BY created_at DESC`;
  params = [results._id];
  results = await handleOrderQuery(sql, params, res, next, status);

  return res.status(StatusCodes.OK).json(results);
});

// 주문 목록 조회
router.get("/", (req, res, next) => {
  res.json("주문 목록 조회");
});

// 주문 상세 상품 조회
router.get("/:id", (req, res, next) => {
  res.json("주문 상세 상품 조회");
});

export default router;
