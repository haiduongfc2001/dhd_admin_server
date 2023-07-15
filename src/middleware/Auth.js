const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

// Middleware for logging out
const isLogout = (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    // Redirect to the login page or send a success response
    res.status(200).json({ message: "Logged out successfully" });
  });
};

const authenticateUser = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const { user } = decoded;
    if (user && user.is_verified === 1) {
      next();
    } else {
      res.status(403).json({
        message: "Truy cập bị từ chối. Tài khoản không hợp lệ.",
      });
    }
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const { user } = decoded;
    if (user && user.is_admin === 1) {
      next();
    } else {
      res.status(403).json({
        message: "Truy cập bị từ chối. Yêu cầu đặc quyền quản trị viên.",
      });
    }
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

module.exports = {
  isLogout,

  authenticateUser,
  authenticateAdmin,
};
