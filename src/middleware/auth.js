const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// 인증된 사용자인지 확인하는 미들웨어
const authenticateToken = (req, res, next) => {
    // 1. 요청 헤더에서 'Authorization' 필드를 찾습니다.
    const authHeader = req.headers['authorization'];
    
    // 포맷: "Bearer TOKEN_STRING" 이므로, 토큰 문자열만 추출합니다.
    // 토큰이 없거나 형식이 잘못된 경우를 대비하여 || (req.query.token) 등으로 대체 가능
    const token = authHeader && authHeader.split(' ')[1]; 
    
    if (!token) {
        // 토큰이 없으면 인증 실패 (401 unauthorized)
        return res.status(401).json({ message: '인증 토큰이 누락되었습니다.' });
    }

    // 2. 토큰 검증
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // 토큰이 유효하지 않거나 만료된 경우 (403 Forbidden)
            return res.status(403).json({ message: '유효하지 않거나 만료된 토큰입니다.' });
        }

        // 3. 토큰이 유효하면 요청 객체(req)에 사용자 정보를 추가합니다.
        // 이 정보는 다음 컨트롤러에서 사용됩니다.
        req.user = user; 

        // 4. 다음 미들웨어/컨트롤러로 진행
        next();
    });
};

module.exports = {
    authenticateToken,
};
