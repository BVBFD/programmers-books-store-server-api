import mysql from "mysql2";

const connectToDatabase = () => {
  try {
    const pool = mysql.createPool({
      host: process.env.MY_SQL_HOST || "localhost",
      user: process.env.MY_SQL_USER || "root",
      password: process.env.MY_SQL_PASSWORD,
      database: process.env.MY_SQL_DATABASE,
      connectionLimit: 10,
      dateStrings: true,
    });

    const connection = pool.promise();

    return connection;
  } catch (error) {
    throw error;
  }
};

export default connectToDatabase;
