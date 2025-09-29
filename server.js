// server.js
const express = require('express');
const dotenv = require('dotenv');

dotenv.config(); 
const dbPool = require('./src/config/db'); // DB 연결 코드

const app = express();
const PORT = process.env.PORT || 3000;

// 라우터 모듈 가져오기
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes'); 
const matchRoutes = require('./src/routes/matchRoutes'); 
const postRoutes = require('./src/routes/postRoutes'); 

app.use(express.json()); // JSON 파서 미들웨어

// API 경로 설정
app.use('/api/auth', authRoutes); // /api/auth/register, /login
app.use('/api/users', userRoutes); // /api/users/me, /checkin
app.use('/api/matches', matchRoutes); // /api/matches/candidates, /swipe
app.use('/api/posts', postRoutes); // /api/posts (CRUD)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('소개팅 어플 백엔드 서버가 실행 중입니다! 💖');
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});