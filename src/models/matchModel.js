const dbPool = require('../config/db');

/**
 * 나에게 아직 노출되지 않았거나 내가 아직 스와이프하지 않은 후보 목록을 조회합니다.
 */
const getCandidates = async (userId, userGender, limit = 10) => {
    // 1. 현재 사용자 정보 가져오기 (태그 정보를 위해)
    const currentUser = await findUserById(userId); 
    // ... (나머지 로직 유지) ...

    let tagPriorityClause = '';
    const queryValues = [targetGender, userId, userId, limitInt];

    // 💡 태그 일치 우선순위 로직 추가
    if (currentUser && currentUser.tags) {
        const userTags = currentUser.tags.split(',').map(tag => tag.trim());
        
        // 쿼리에 태그 일치 여부 확인 로직을 추가
        if (userTags.length > 0) {
             // 쿼리에서 LIKE 검색을 사용해 태그 우선순위를 부여합니다.
             // (쉼표로 구분된 문자열에서 태그 하나라도 일치하면 높은 순위 부여)
             tagPriorityClause = userTags.map(tag => `
                 (u.tags LIKE '%${tag}%')
             `).join(' OR ');
             
             tagPriorityClause = `CASE WHEN ${tagPriorityClause} THEN 0 ELSE 1 END,`;
        }
    }


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
            ${tagPriorityClause}        <-- 👈 태그 우선 순위 적용
            u.created_at DESC         
        LIMIT ${limitInt}
    `;

    // 쿼리 실행
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