// src/config/db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config(); 

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT, 
  waitForConnections: true, 
  connectionLimit: 10,      
  queueLimit: 0            
});

pool.getConnection()
  .then(connection => {
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('>> DB 접속 정보를 확인하거나 MySQL 서버를 실행해 주세요.');
  });

module.exports = pool;