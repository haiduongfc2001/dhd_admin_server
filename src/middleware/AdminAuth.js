const isLogin = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            next();
        } else {
            return res.status(401).json({ message: 'Unauthorized' });
        }
    } catch (error) {
        console.log(error.message);
    }
};

const isLogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            return res.status(200).json({ message: 'Already logged in' });
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

const authAdmin = async (req, res, next) => {
    try {
        if (!req.session.adminId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        next();
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    isLogin,
    isLogout,
    authAdmin
};



// const isLogin = async (req, res, next) => {
//     try {
//
//         if (req.session.user_id) {
//
//         } else {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         next();
//
//     } catch (error) {
//         console.log(error.message);
//     }
// }
//
// const isLogout = async (req, res, next) => {
//     try {
//
//         if (req.session.user_id) {
//             return res.status(200).json({ message: 'Login successfully!' });
//         }
//         next();
//
//     } catch (error) {
//         console.log(error.message);
//     }
// }
//
// const authAdmin = async (req, res, next) => {
//     try {
//
//         if (!req.session.adminId) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }
//         next();
//
//     } catch (error) {
//         console.log(error.message);
//     }
// }
//
// module.exports = {
//     isLogin,
//     isLogout,
//     authAdmin
// }