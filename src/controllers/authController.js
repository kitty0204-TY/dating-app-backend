// src/controllers/authController.js
const bcrypt = require('bcrypt'); // 비밀번호 해싱 라이브러리
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // 사용자 모델 가져오기

const JWT_SECRET = process.env.JWT_SECRET; //
const SALT_ROUNDS = 10; // 비밀번호 해싱 강도

const register = async (req, res) => {
    console.log('프론트에서 받은 데이터:', req.body);
    const { email, password, nickname, gender, birth_date, real_name, tags, majorId, mbti } = req.body; 

    // 💡 필수 입력값 검사 (mbti는 선택 사항일 수 있으므로 제외)
    if (!email || !password || !nickname || !gender || !birth_date || !majorId || !tags) { 
        return res.status(400).json({ message: '모든 필수 정보를 입력해야 합니다.' });
    }
    
    try {
        // ... (중복 검사, 해싱 로직 유지) ...
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const finalRealName = real_name || null;
        const finalTags = tags || null; 
        const finalMbti = mbti || null; // 👈 mbti 처리
        const finalMajorId = parseInt(majorId, 10); 

        // 4. 사용자 등록 (userModel.js 수정 필요!)
        const userId = await userModel.registerUser(
            email, hashedPassword, nickname, finalRealName, 
            gender, birth_date, finalTags, finalMajorId, finalMbti // 👈 mbti 전달
        );

        res.status(201).json({ message: '회원가입에 성공했습니다.', userId: userId });
    } catch (error) {
        console.error('회원가입 중 서버 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 회원가입에 실패했습니다.' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: '이메일과 비밀번호를 입력해야 합니다.' });
    }

    try {
        // 1. 사용자 존재 여부 확인
        const user = await userModel.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: '인증 정보가 올바르지 않습니다.' }); // 401 Unauthorized
        }

        // 2. 비밀번호 일치 여부 확인 (해싱된 비밀번호와 비교)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: '인증 정보가 올바르지 않습니다.' });
        }

        // 3. JWT 토큰 생성
        const token = jwt.sign(
            { id: user.id, email: user.email }, // 토큰에 담을 정보 (Payload)
            JWT_SECRET, 
            { expiresIn: '1h' } // 토큰 유효 시간 설정 (예: 1시간)
        );

        // 4. 성공 응답 (토큰 반환)
        res.status(200).json({
            message: '로그인 성공',
            token: token,
            user: { id: user.id, nickname: user.nickname }
        });

    } catch (error) {
        console.error('로그인 중 서버 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 로그인에 실패했습니다.' });
    }
};

module.exports = {
    register,
    login, // login 함수를 모듈로 내보냅니다.
};
