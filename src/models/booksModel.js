import handleQuery from "../db/handleQuery.js";
import conn from "../db/mariadb.js";

class Book {
  constructor() {
    this.connection = conn();
  }

  async findAllBooks() {
    const results = await handleQuery("SELECT * FROM books", []);
    return results;
  }

  async findBooksByNewsAndCategory(categoryId, news, limit, currentPage) {
    let sql = "SELECT * FROM books";
    const params = [];
    let results;

    if (!currentPage) {
      results = {
        success: false,
        results: { message: "currentPage 쿼리 값이 없습니다!" },
      };

      return results;
    }

    if (!limit) {
      results = {
        success: false,
        results: { message: "limit 쿼리 값이 없습니다!" },
      };

      return results;
    }

    const parsedIntLimit = parseInt(limit); // limit를 정수로 변환
    const parsedIntCurrentPage = parseInt(currentPage); // currentPage를 정수로 변환
    const offset = parsedIntLimit * (parsedIntCurrentPage - 1); // offset 계산

    if (categoryId) {
      params.push(categoryId);
    }

    if (categoryId || news) {
      sql += " WHERE";
    }

    if (categoryId && !news) {
      sql += " category_id = ?";
    }

    if (!categoryId && news) {
      sql += " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW()";
    }

    if (categoryId && news) {
      sql +=
        " pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() AND category_id = ?";
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(parsedIntLimit, offset); // 변환된 limit와 offset을 params 배열에 추가

    results = await handleQuery(sql, params);
    return results;
  }

  async findBookById(id) {
    const sql = `SELECT *, 
    (SELECT count(*) FROM user_likes_table WHERE user_likes_table.books_id = books._id) AS likes FROM books LEFT JOIN categories 
    ON books.category_id = categories.category_id 
    WHERE books._id = ?`;
    const params = [id];
    const results = await handleQuery(sql, params);

    return results;
  }
}

export default Book;
