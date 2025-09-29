// src/controllers/authController.js
const bcrypt = require('bcrypt'); // 비밀번호 해싱 라이브러리
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel'); // 사용자 모델 가져오기

const JWT_SECRET = process.env.JWT_SECRET; //
const SALT_ROUNDS = 10; // 비밀번호 해싱 강도

const register = async (req, res) => {
    // 💡 real_name을 추가하고, 필수 입력값 검사도 업데이트합니다.
    const { email, password, nickname, gender, birth_date, real_name } = req.body; 

    // real_name은 선택적 정보일 수 있으므로 필수 검사에서는 뺍니다.
    if (!email || !password || !nickname || !gender || !birth_date) {
        return res.status(400).json({ message: '모든 필수 정보를 입력해야 합니다.' });
    }

    try {
        // 2. 이메일 중복 검사
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: '이미 존재하는 이메일입니다.' }); // 409 Conflict
        }

        // 3. 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // 💡 real_name 값이 없으면 DB에 NULL로 전달하도록 수정
        const finalRealName = real_name || null;

        // 4. 사용자 등록
        const userId = await userModel.registerUser(
        email,
        hashedPassword,
        nickname,
        finalRealName, // 👈 인자 순서와 값 확인
        gender,
        birth_date
        );

        // 5. 성공 응답
        res.status(201).json({ 
            message: '회원가입에 성공했습니다.', 
            userId: userId 
        }); // 201 Created

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
