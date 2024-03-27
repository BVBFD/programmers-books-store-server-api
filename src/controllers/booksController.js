import handleQuery from "../db/handleQuery.js";
import { v4 as uuidv4 } from "uuid";
import { StatusCodes } from "http-status-codes";
import Book from "../models/booksModel.js";

const book = new Book();

const getAllBookAndByCategory = async (req, res, next) => {
  const { categoryId, news, limit, currentPage } = req.query;
  let queryResult;

  if (!categoryId && !news && !limit && !currentPage) {
    queryResult = await book.findAllBooks();
  } else {
    queryResult = await book.findBooksByNewsAndCategory(
      categoryId,
      news,
      limit,
      currentPage
    );
  }

  const { success, results } = queryResult;

  if (results.length === 0) {
    return res.status(StatusCodes.NO_CONTENT).json(results);
  }

  return res
    .status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
    .json(results);
};

const getIndividualBook = async (req, res, next) => {
  const { id } = req.params;
  const { success, results } = await book.findBookById(id);

  return res
    .status(success ? StatusCodes.OK : StatusCodes.BAD_REQUEST)
    .json(results);
};

export { getAllBookAndByCategory, getIndividualBook };
