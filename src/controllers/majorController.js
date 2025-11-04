// src/controllers/majorController.js
const majorModel = require('../models/majorModel');

const getAllMajors = async (req, res) => {
    try {
        const majors = await majorModel.getAllMajors();
        res.status(200).json(majors);
    } catch (error) {
        console.error('학과 목록 조회 오류:', error);
        res.status(500).json({ message: '학과 목록을 불러오는 데 실패했습니다.' });
    }
};

module.exports = {
    getAllMajors,
};