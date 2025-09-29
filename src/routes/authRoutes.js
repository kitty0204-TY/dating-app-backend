// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register : 회원가입 API 엔드포인트
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;