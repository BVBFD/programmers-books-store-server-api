import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import corsOpt from "./utils/corsOpt.js";

import usersRouter from "./routers/users.js";
import booksRouter from "./routers/books.js";
import categoriesRouter from "./routers/categories.js";
import cartsRouter from "./routers/carts.js";
import likesRouter from "./routers/likes.js";
import ordersRouter from "./routers/orders.js";

const app = express();

app.use(cors(corsOpt));
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser(`cookie secret key`));

app.use("/users", usersRouter);
app.use("/books", booksRouter);
app.use("/categories", categoriesRouter);
app.use("/carts", cartsRouter);
app.use("/likes", likesRouter);
app.use("/orders", ordersRouter);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Something went wrong!";

  return res.status(status).json({
    success: false,
    status,
    message,
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log(`Server is running on Port ${process.env.PORT}!!`);
});
