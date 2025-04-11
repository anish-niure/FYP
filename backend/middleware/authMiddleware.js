const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to the request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Invalid Token' });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied: Unauthorized Role' });
        }
        next();
    };
};

const verifyAdmin = [authenticate, authorize(['admin'])];

module.exports = { authenticate, authorize, verifyAdmin };