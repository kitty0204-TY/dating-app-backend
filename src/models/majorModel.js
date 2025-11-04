// src/models/majorModel.js
const dbPool = require('../config/db');

const getAllMajors = async () => {
    const query = `
        SELECT id, college_name, major_name 
        FROM majors
        ORDER BY college_name, major_name
    `;
    const [rows] = await dbPool.execute(query);
    return rows;
};

module.exports = {
    getAllMajors,
};