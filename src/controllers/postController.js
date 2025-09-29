// src/controllers/postController.js
const postModel = require('../models/postModel');

// 1. 새 게시물 생성 (POST /api/posts)
const create = async (req, res) => {
    const userId = req.user.id; // 인증 미들웨어에서 가져온 작성자 ID
    const { title, content, image_url } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용은 필수 입력 항목입니다.' });
    }

    try {
        const postId = await postModel.createPost(userId, title, content, image_url || null);
        res.status(201).json({ message: '게시물 생성 성공', postId });
    } catch (error) {
        console.error('게시물 생성 오류:', error);
        res.status(500).json({ message: '게시물 생성에 실패했습니다.' });
    }
};

// 2. 게시물 목록 조회 (GET /api/posts)
const getPosts = async (req, res) => {
    try {
        const posts = await postModel.getLatestPosts(5); // 최신 5개
        res.status(200).json(posts);
    } catch (error) {
        console.error('게시물 조회 오류:', error);
        res.status(500).json({ message: '게시물 조회에 실패했습니다.' });
    }
};

// 3. 특정 게시물 조회 (GET /api/posts/:postId)
const getPost = async (req, res) => {
    const postId = req.params.postId;
    try {
        const post = await postModel.getPostById(postId);
        if (!post) {
            return res.status(404).json({ message: '게시물을 찾을 수 없습니다.' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('특정 게시물 조회 오류:', error);
        res.status(500).json({ message: '게시물 조회에 실패했습니다.' });
    }
};

// 4. 게시물 수정 (PUT /api/posts/:postId)
const updatePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const { title, content, image_url } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: '제목과 내용은 필수 입력 항목입니다.' });
    }

    try {
        const affectedRows = await postModel.updatePost(postId, userId, title, content, image_url || null);
        if (affectedRows === 0) {
            // 게시물이 없거나, 작성자가 아닐 경우
            return res.status(404).json({ message: '게시물을 찾을 수 없거나 수정 권한이 없습니다.' });
        }
        res.status(200).json({ message: '게시물 수정 성공' });
    } catch (error) {
        console.error('게시물 수정 오류:', error);
        res.status(500).json({ message: '게시물 수정에 실패했습니다.' });
    }
};

// 5. 게시물 삭제 (DELETE /api/posts/:postId)
const deletePost = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    try {
        const affectedRows = await postModel.deletePost(postId, userId);
        if (affectedRows === 0) {
            return res.status(404).json({ message: '게시물을 찾을 수 없거나 삭제 권한이 없습니다.' });
        }
        res.status(200).json({ message: '게시물 삭제 성공' });
    } catch (error) {
        console.error('게시물 삭제 오류:', error);
        res.status(500).json({ message: '게시물 삭제에 실패했습니다.' });
    }
};

module.exports = {
    create,
    getPosts,
    getPost,
    updatePost,
    deletePost,
};