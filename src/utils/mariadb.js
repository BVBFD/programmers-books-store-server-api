import mysql from "mysql2";

const connectToDatabase = () => {
  try {
    // MySQL 연결 풀 생성
    const pool = mysql.createPool({
      host: process.env.MY_SQL_HOST || "localhost",
      user: process.env.MY_SQL_USER || "root",
      password: process.env.MY_SQL_PASSWORD,
      database: process.env.MY_SQL_DATABASE,
      connectionLimit: 10,
      dateStrings: true,
    });

    // promise() 메서드를 사용하여 비동기 함수로 변환
    const connection = pool.promise();
    // 반환된 연결을 사용하여 비동기적으로 쿼리 수행 가능

    // 예시: 비동기적으로 쿼리 수행
    // const [rows, fields] = await connection.query('SELECT * FROM mytable');
    return connection;
  } catch (error) {
    // 에러 처리
    console.error("Error connecting to the database:", error);
    throw error;
  }
};

export default connectToDatabase;
