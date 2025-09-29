// src/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth'); 
const postController = require('../controllers/postController');

// 1. 게시물 목록 조회 (최신 5개) - 인증 필요 없음
router.get('/', postController.getPosts);

// 2. 특정 게시물 조회 - 인증 필요 없음
router.get('/:postId', postController.getPost);

// 아래는 인증된 사용자만 가능 (CRUD)
// 3. 새 게시물 생성
router.post('/', authenticateToken, postController.create);

// 4. 게시물 수정
router.put('/:postId', authenticateToken, postController.updatePost);

// 5. 게시물 삭제
router.delete('/:postId', authenticateToken, postController.deletePost);

module.exports = router;