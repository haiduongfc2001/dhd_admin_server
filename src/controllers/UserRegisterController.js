const UserRegister = require("../models/UserRegisterModel");

// Thêm user mới đăng ký
const AddUser = async (req, res) => {

    try {

        const userregister = new UserRegister ({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            password: req.body.password,
        });

        const result = await userregister.save();
        res.json(result);

    } catch (error) {
        res.send(error.message);
    }
}

module.exports = {
    AddUser,
}