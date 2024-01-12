import mysql from "mysql2";

const connectToDatabase = () => {
  // try ~ catch 문법
  // 개발자가 예상하지 못한 에러 (실수, 사용자 입력을 잘못한 것, DB가 응답 잘못한 것)들을 처리!!!
  // try 구문의 코드를 실행하다가 에러가 발생하면 => catch로 바로 빠져나감.
  // try 구문에서 어떠한 에러가 발생해도, 우리가 다 if문 분기 처리를 해주던 내용들이 자동으로 catch에 잡힌다.
  // 그리고 에러가 발생해도 프로그램이 아예 stop되거나 죽지않는다.
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
    // error.name, error.message 내장 에러 객체, 에러 처리
    console.error("Error connecting to the database:", error);

    // throw는 에러를 발생시키는 연산자
    // 만약 try 안에에서 쓴다면, 바로 catch로 넘어간다.
    throw error;
  }
};

export default connectToDatabase;
