const userModel = require('../models/userModel');

// GET /api/users/me (내 프로필 조회)
async function getProfile(req, res) {
    // 인증 미들웨어(auth.js)에서 추가된 사용자 ID를 가져옴
    const userId = req.user.id; 

    try {
        const userProfile = await userModel.findUserById(userId);

        if (!userProfile) {
            return res.status(404).json({ message: "사용자 프로필을 찾을 수 없습니다." });
        }
        
        // 비밀번호를 제외한 프로필 정보만 클라이언트에 응답
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('프로필 조회 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 프로필 조회에 실패했습니다.' });
    }
}

// PUT /api/users/me (내 프로필 수정)
const updateProfile = async (req, res) => {
    const userId = req.user.id;
    // 수정 가능한 모든 필드
    const { nickname, bio, profile_image_url, real_name, tags, photo_status } = req.body;
    
    const updateFields = {};
    if (nickname !== undefined) updateFields.nickname = nickname;
    if (bio !== undefined) updateFields.bio = bio;
    if (profile_image_url !== undefined) updateFields.profile_image_url = profile_image_url;
    if (real_name !== undefined) updateFields.real_name = real_name;
    if (tags !== undefined) updateFields.tags = tags;
    if (photo_status !== undefined) updateFields.photo_status = photo_status; // 'yes' 또는 'no'

    if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: '업데이트할 정보가 없습니다.' });
    }

    try {
        const result = await userModel.updateProfile(userId, updateFields);
        res.status(200).json({ message: '프로필이 성공적으로 업데이트되었습니다.' });
    } catch (error) {
        console.error('프로필 수정 중 서버 오류 발생:', error);
        res.status(500).json({ message: '서버 오류로 인해 프로필 수정에 실패했습니다.' });
    }
};

// POST /api/users/checkin - 위치 체크인 (실시간 매칭용)
const checkInLocation = async (req, res) => {
    const userId = req.user.id;
    const { locationId } = req.body;

    if (!locationId) {
        return res.status(400).json({ message: '위치 ID는 필수입니다.' });
    }

    try {
        await userModel.updateLocation(userId, locationId); 
        res.status(200).json({ 
            message: '위치 체크인 성공', 
            locationId: locationId 
        });
    } catch (error) {
        console.error('위치 체크인 오류:', error);
        res.status(500).json({ message: '위치 체크인에 실패했습니다.' });
    }
};

module.exports = {
    getMyProfile: getProfile,
    updateProfile,
    checkInLocation,
};