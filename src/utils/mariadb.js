import mysql from "mysql2";

const connection = () =>
  mysql
    .createPool({
      host: `${process.env.MY_SQL_HOST}` || "localhost",
      user: `${process.env.MY_SQL_USER}` || "root",
      //   timezone: "Asia/Seoul",
      password: `${process.env.MY_SQL_PASSWORD}`,
      database: `${process.env.MY_SQL_DATABASE}`,
      connectionLimit: 10,
      dateStrings: true,
    })
    .promise();

export default connection;
