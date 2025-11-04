// src/routes/majorRoutes.js
const express = require('express');
const router = express.Router();
const majorController = require('../controllers/majorController');

// GET /api/majors (학과 전체 목록 조회)
router.get('/', majorController.getAllMajors);

module.exports = router;