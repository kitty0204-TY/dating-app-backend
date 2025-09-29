// src/controllers/matchController.js
const matchModel = require('../models/matchModel');
const userModel = require('../models/userModel'); 

/**
 * GET /api/matches/candidates - 매칭 후보 목록 조회
 */
async function getCandidates(req, res) { 
    const userId = req.user.id; 

    try {
        // 1. 현재 사용자 정보 가져오기 (위치 정보를 위해 userModel.findUserById 사용)
        const currentUser = await userModel.findUserById(userId); 
        if (!currentUser) {
            return res.status(404).json({ message: "사용자 정보를 찾을 수 없습니다." });
        }
        
        const targetGender = currentUser.gender === 'male' ? 'female' : 'male';
        const limitInt = 10; // limit을 10으로 고정

        // 💡 2. 위치 기반 우선 순위 로직
        const currentLocation = currentUser.current_location_id;
        let locationPriorityClause = '';
        
        if (currentLocation) {
            // ORDER BY 절에 위치 우선 순위 추가
            locationPriorityClause = `
                CASE WHEN u.current_location_id = '${currentLocation}' THEN 0 ELSE 1 END,
            `;
        }

        // 3. 매칭 후보 조회 쿼리
        const query = `
            SELECT 
                u.id, u.email, u.nickname, u.gender, u.birth_date, u.bio, u.profile_image_url
            FROM 
                users u
            WHERE 
                u.gender = ?
                AND u.id != ?
                AND u.id NOT IN (
                    SELECT user_id_target 
                    FROM matches 
                    WHERE user_id_swiper = ?
                )
            ORDER BY
                ${locationPriorityClause} 
                u.created_at DESC         
            LIMIT ${limitInt}
        `;
        
        // 4. DB 쿼리 실행
        const [rows] = await dbPool.execute(query, [targetGender, userId, userId]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('후보 조회 중 서버 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 후보 조회에 실패했습니다.' });
    }
};

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
};

module.exports = {
    getCandidates,
    swipe,
};