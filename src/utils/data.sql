-- 1. LEFT JOIN 문 구하기
SELECT books._id, title, category, form, isbn, img, summary, detail, author, pages, contents, price, likes, pub_date, books.updated_at, books.created_at 
FROM books
LEFT JOIN categories
ON books.category_id = categories._id
WHERE books._id = "2c644524-c692-4423-9db3-605ab2b5aacb";

-- 2. SQL 시간 범위 구하기
-- 시간 더하기 +
SELECT DATE_ADD(NOW(), INTERVAL 1 MONTH);
-- 시간 빼기 -
SELECT DATE_SUB(NOW(), INTERVAL 1 MONTH);
-- 최근 한달 내의 최신 도서 정보만 받기
SELECT * FROM books 
WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW();
-- 최근 한달 내의 특청 카테고리 도서 정보만 받기
SELECT * FROM books 
WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 1 MONTH) AND NOW() 
AND books.category_id="bc73d103-5808-431a-a110-0d57c5143e2a";

-- 3. 도서 목록 페이징 하기
-- created_at 내림차순으로 정렬해서 1페이지 당 5개씩 뽀아오기
-- 1페이지 클릭 5개 뽑아오기
SELECT * FROM books 
ORDER BY created_at 
DESC LIMIT 5 OFFSET 0;
-- 2페이지 클릭 5개 뽑아오기
SELECT * FROM books 
ORDER BY created_at 
DESC LIMIT 5 OFFSET 5;
-- 3페이지 클릭 5개 뽑아오기
SELECT * FROM books 
ORDER BY created_at 
DESC LIMIT 5 OFFSET 10;
-- LIMIT : 출력할 행의 수
-- OFFSET : 시작 지점 ( 내가 지금 몇페이지더라? ) 

limit : page 당 도서 수        ex. 3
currentPage : 현재 몇 페이지   ex. 1, 2, 3 ...
offset : 시작 시점             ex. 0, 3, 6, 9, 12
offset = limit * (currentPage - 1)