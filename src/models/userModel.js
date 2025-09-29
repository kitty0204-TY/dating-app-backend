// src/models/userModel.js
const dbPool = require('../config/db');

// 새 사용자 생성 (회원가입)
const registerUser = async (email, hashedPassword, nickname, real_name, gender, birth_date) => {
    const query = `
        INSERT INTO users (email, password, nickname, real_name, gender, birth_date)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    // 6개의 인자를 정확히 전달
    const [result] = await dbPool.execute(query, [email, hashedPassword, nickname, real_name, gender, birth_date]);
    return result.insertId;
};

// 이메일로 사용자 조회 (로그인 및 중복 체크)
const findUserByEmail = async (email) => {
    const [rows] = await dbPool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// ID로 사용자 프로필 조회 (토큰 검증 후 사용)
const findUserById = async (userId) => {
    const query = `
        SELECT id, email, nickname, real_name, tags, bio, gender, birth_date, profile_image_url, photo_status
        FROM users 
        WHERE id = ?
    `;
    const [rows] = await dbPool.execute(query, [userId]);
    return rows[0];
};

// 프로필 정보 업데이트
const updateProfile = async (userId, updateFields) => {
    const setClauses = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateFields);

    if (setClauses.length === 0) {
        return { affectedRows: 0 };
    }

    const query = `
        UPDATE users
        SET ${setClauses}
        WHERE id = ?
    `;
    values.push(userId);
    const [result] = await dbPool.execute(query, values);
    return result;
};

// 위치 정보 업데이트 (체크인 기능)
const updateLocation = async (userId, locationId) => {
    const query = `
        UPDATE users
        SET current_location_id = ?
        WHERE id = ?
    `;
    const [result] = await dbPool.execute(query, [locationId, userId]);
    return result;
};

module.exports = {
    registerUser,
    findUserByEmail,
    findUserById,
    updateProfile,
    updateLocation,
};