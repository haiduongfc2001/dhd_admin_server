const isLogin = async (req, res, next) => {
    try {
        if (req.session._id) {
            next();
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    } catch (err) {
        console.log(err.message)
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session._id) {
            return res.status(200).json({ message: 'Already logged in' });
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout
}