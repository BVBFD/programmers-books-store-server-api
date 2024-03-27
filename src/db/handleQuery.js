import conn from "../db/mariadb.js";

const handleQuery = async (sql, params) => {
  let connection;
  try {
    connection = conn();
    const [results] = await connection.query(sql, params);

    return { success: true, results };
  } catch (error) {
    const errorMessage = error.message || "Unknown error occurred";

    return {
      success: false,
      results: errorMessage,
    };
  } finally {
    if (connection) {
      connection.releaseConnection(connection);
    }
  }
};

export default handleQuery;
