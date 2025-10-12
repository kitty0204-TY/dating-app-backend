// src/controllers/matchController.js
const matchModel = require('../models/matchModel');
// 💡 userModel에서 필요한 함수(findUserById)만 명시적으로 구조 분해 할당하여 가져옵니다.
const { findUserById } = require('../models/userModel'); 

/**
 * GET /api/matches/candidates - 매칭 후보 목록 조회
 */
async function getCandidates(req, res) {
    // req.user는 인증 미들웨어에서 추가된 로그인 사용자 정보 (ID, email)
    const userId = req.user.id; 

    try {
        // 1. 현재 사용자의 성별 정보를 가져와서 반대 성별 후보를 찾기 위해 사용
        // 이제 findUserById 함수를 직접 호출합니다.
        const currentUser = await findUserById(userId); 
        if (!currentUser) {
            return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
        }

        // 2. 모델을 통해 후보 목록을 조회
        const candidates = await matchModel.getCandidates(
            userId, 
            currentUser.gender, // 👈 currentUser 객체에서 gender 필드를 사용
            10
        );

        res.status(200).json(candidates);
    } catch (error) {
        console.error('후보 조회 중 서버 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 후보 조회에 실패했습니다.' });
    }
}

/**
 * POST /api/matches/swipe - 스와이프 처리 (좋아요/싫어요)
 */
async function swipe(req, res) {
    const swiperId = req.user.id;
    const { targetId, direction } = req.body; 

    // 1. 입력값 유효성 검사
    if (!targetId || !direction || !['like', 'nope'].includes(direction)) {
        return res.status(400).json({ message: '잘못된 요청입니다. targetId와 direction(like/nope)이 필요합니다.' });
    }
    if (swiperId === targetId) {
        return res.status(400).json({ message: '자기 자신에게 스와이프할 수 없습니다.' });
    }

    try {
        // 2. 스와이프 기록 저장 및 매칭 확인
        const matchResult = await matchModel.recordSwipeAndCheckMatch(
            swiperId, 
            targetId, 
            direction
        );

        // 3. 결과 응답
        if (matchResult.isMatch) {
            return res.status(200).json({ message: '축하합니다! 매칭되었습니다!', isMatch: true, targetId });
        } else {
            return res.status(200).json({ message: '스와이프 성공', isMatch: false });
        }
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '이미 스와이프한 대상입니다.' });
        }
        console.error('스와이프 처리 중 서버 오류 발생:', error);
        res.status(500).json({ message: '스와이프 처리 중 서버 오류가 발생했습니다.' });
    }
}

module.exports = {
    getCandidates,
    swipe,
};