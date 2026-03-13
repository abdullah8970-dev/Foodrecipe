const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            req.user = null;
            return next();
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key_123");
        req.user = decoded;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = authMiddleware;

