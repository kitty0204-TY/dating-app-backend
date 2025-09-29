// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/userController');

// GET /api/users/me : 내 프로필 조회 (인증 필요)
router.get('/me', authenticateToken, userController.getMyProfile);

// PUT /api/users/me : 내 프로필 수정 (인증 필요)
router.put('/me', authenticateToken, userController.updateProfile);

// POST /api/users/checkin : 위치 체크인 (인증 필요)
router.post('/checkin', authenticateToken, userController.checkInLocation);

module.exports = router;