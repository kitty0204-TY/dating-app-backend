const dbPool = require('../config/db');

/**
 * 나에게 아직 노출되지 않았거나 내가 아직 스와이프하지 않은 후보 목록을 조회합니다.
 */
const getCandidates = async (userId, userGender, limit = 10) => {
    const targetGender = userGender === 'male' ? 'female' : 'male';
    const limitInt = parseInt(limit, 10); // LIMIT 인자를 정수로 확실하게 변환

    // 쿼리 내부에 ?를 3개만 사용하고, LIMIT 값은 문자열에 직접 삽입합니다.
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
        LIMIT ${limitInt}
    `;
    
    // DB 쿼리 실행: 물음표 3개에 맞는 인자 3개만 전달합니다.
    const [rows] = await dbPool.execute(query, [targetGender, userId, userId]);
    return rows;
};

/**
 * 스와이프 기록을 저장하고 매칭 여부를 확인합니다.
 */
const recordSwipeAndCheckMatch = async (swiperId, targetId, direction) => {
    // 1. 스와이프 기록 저장
    const insertQuery = `
        INSERT INTO matches (user_id_swiper, user_id_target, swipe_direction)
        VALUES (?, ?, ?)
    `;
    await dbPool.execute(insertQuery, [swiperId, targetId, direction]);

    if (direction === 'nope') {
        return { isMatch: false }; 
    }

    // 2. 매칭 확인: 상대방이 나를 '좋아요' 했는지 확인
    const checkMatchQuery = `
        SELECT 1 
        FROM matches 
        WHERE user_id_swiper = ?
          AND user_id_target = ?
          AND swipe_direction = 'like'
    `;
    const [rows] = await dbPool.execute(checkMatchQuery, [targetId, swiperId]);
    
    const isMatch = rows.length > 0;

    if (isMatch) {
        // 3. 매칭 성사 시, 양쪽의 is_match 필드를 TRUE로 업데이트
        const updateQuery = `
            UPDATE matches
            SET is_match = TRUE
            WHERE (user_id_swiper = ? AND user_id_target = ?) 
               OR (user_id_swiper = ? AND user_id_target = ?)
        `;
        await dbPool.execute(updateQuery, [swiperId, targetId, targetId, swiperId]);
    }

    return { isMatch };
};

module.exports = {
    getCandidates,
    recordSwipeAndCheckMatch,
};