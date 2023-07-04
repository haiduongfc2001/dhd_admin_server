// const isLogin = async (req, res, next) => {
//     try {
//         if (req.session._id) {
//             next();
//         } else {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         next();
//     } catch (err) {
//         console.log(err.message)
//     }
// };

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from the request header
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, 'your-secret-key');

        // Add the decoded user ID to the request object
        req.userId = decodedToken.userId;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

const isLogin = (req, res, next) => {
    // Check if user is logged in
    if (req.session && req.session.user) {
        // User is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // User is not logged in, redirect to login page or send an error response
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Middleware for admin authentication
const isAdminLogin = (req, res, next) => {
    // Check if admin is logged in
    if (req.session  && req.session.adminId) {
        // Admin is logged in, proceed to the next middleware or route handler
        next();
    } else {
        // Admin is not logged in or not authorized, redirect to login page or send an error response
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// Middleware for logging out
const isLogout = (req, res) => {
    // Destroy the session to log out the user
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        // Redirect to the login page or send a success response
        res.status(200).json({ message: 'Logged out successfully' });
    });
};

// const isLogout = async (req, res, next) => {
//     try {
//         if (req.session._id) {
//             return res.status(200).json({ message: 'Already logged in' });
//         }
//         next();
//     } catch (error) {
//         console.log(error.message);
//     }
// };

module.exports = {
    isLogin,
    isAdminLogin,
    isLogout,
    authMiddleware
}