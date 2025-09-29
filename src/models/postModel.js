// src/models/postModel.js
const dbPool = require('../config/db');

// 새 게시물 생성 (Create)
const createPost = async (userId, title, content, imageUrl) => {
    const query = `
        INSERT INTO posts (user_id, title, content, image_url)
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await dbPool.execute(query, [userId, title, content, imageUrl]);
    return result.insertId;
};

// 특정 게시물 조회 (Read)
const getPostById = async (postId) => {
    const query = `
        SELECT p.*, u.nickname as author_nickname 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `;
    const [rows] = await dbPool.execute(query, [postId]);
    return rows[0];
};

// 게시물 목록 (최신 5개) 조회 (Read)
const getLatestPosts = async (limit = 5) => {
    const query = `
        SELECT p.*, u.nickname as author_nickname 
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ?
    `;
    const [rows] = await dbPool.execute(query, [limit]);
    return rows;
};

// 게시물 수정 (Update)
const updatePost = async (postId, userId, title, content, imageUrl) => {
    const query = `
        UPDATE posts
        SET title = ?, content = ?, image_url = ?
        WHERE id = ? AND user_id = ?
    `;
    const [result] = await dbPool.execute(query, [title, content, imageUrl, postId, userId]);
    return result.affectedRows;
};

// 게시물 삭제 (Delete)
const deletePost = async (postId, userId) => {
    const query = `
        DELETE FROM posts
        WHERE id = ? AND user_id = ?
    `;
    const [result] = await dbPool.execute(query, [postId, userId]);
    return result.affectedRows;
};

module.exports = {
    createPost,
    getPostById,
    getLatestPosts,
    updatePost,
    deletePost,
};