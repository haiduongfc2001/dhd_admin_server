const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const fs = require("fs");

require('dotenv').config(); // Add this line to load environment variables
const {HOST, PORT, USERNAME, PASSWORD, BASE_URL, BASE_ADMIN_URL} = require("../config/MailConfig");
const Product = require("../models/ProductModel/ProductModel");
const path = require("path");

// <a href="http://127.0.0.1:3000/verify?id=' + user_id + '"> Verify </a>
// <a href="http://127.0.0.1:3000/forget-password?token=' + token + '"> Reset </a>


const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (err) {
        console.log(err.message);
    }
}

const sendResetPasswordMail = async (name, email, token) => {
    try {
        const resetPasswordLink = `${BASE_URL}/forget-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: HOST,
            port: PORT,
            secure: false, // upgrade later with STARTTLS
            requireTLS: true,
            auth: {
                user: USERNAME, // Use environment variable for email username
                pass: PASSWORD, // Use environment variable for email password
            },
        });

        const MailOptions = {
            from: USERNAME, // Use the same email username as the sender
            to: email,
            subject: 'For Reset Password',
            html: '<p>Hi <b>' + name + '</b>, please click here to ' +
                '<a href="' + resetPasswordLink + '"> Reset </a> ' +
                'your password.</p>',
        }

        transporter.sendMail(MailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

// For send mail
const addUserMail = async (name, email, password, user_id) => {
    try {
        const userVerificationLink = `${BASE_URL}/verify?id=${user_id}`;

        const transporter = nodemailer.createTransport({
            host: HOST,
            port: PORT,
            secure: false, // upgrade later with STARTTLS
            requireTLS: true,
            auth: {
                user: USERNAME, // Use environment variable for email username
                pass: PASSWORD, // Use environment variable for email password
            },
        });

        const MailOptions = {
            from: USERNAME, // Use the same email username as the sender
            to: email,
            subject: 'Admin add you and verify your email',
            html: '<p>Hi ' + name + ', please click here to ' +
                '<a href="' + userVerificationLink + '">Verify</a> ' +
                'your mail.</p>' +
                '<br>' +
                'Email: <b>' + email + '</b>' +
                '<br>' +
                'Password: <b>' + password + '</b>',
        }

        transporter.sendMail(MailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent: ' + info.response);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
};


const LoadLogin = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }
}

const VerifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email: email});

        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('login', {message: 'Email and password is incorrect'});
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/admin/home');
                }
            } else {
                res.render('login', {message: 'Email and password is incorrect'});
            }

        } else {
            res.render('login', {message: 'Email and password is incorrect'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

const LoadDashboard = async (req, res) => {
    try {
        const userData = await User.findById({_id: req.session.user_id})
        res.render('home', {admin: userData});
    } catch (error) {
        console.log(error.message);
    }
}

const Logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const ForgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message);
    }
}

const ForgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email});
        if (userData) {
            if (userData.is_admin === 0) {
                res.render('forget', {message: 'Email is incorrect'});
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email: email}, {$set: {token: randomString}});
                await sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', {message: 'Please check your email to reset your password!'})
            }
        } else {
            res.render('forget', {message: 'Email is incorrect'});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const ForgetPasswordLoad = async (req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({token: token});

        if (tokenData) {
            res.render('forget-password', {user_id: tokenData._id})
        } else {
            res.render('404', {message: 'Invalid link!'})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const ResetPassword = async (req, res) => {
    try {

        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id: user_id}, {
            $set: {
                password: secure_password,
                token: ''
            }
        });

        res.redirect('/admin');

    } catch (error) {
        console.log(error.message)
    }
}

const AdminDashboard = async (req, res) => {
    try {
        const userData = await User.find({is_admin: 0})
        res.render('dashboard', {users: userData})
    } catch (error) {
        console.log(error.message);
    }
}

const NewUserLoad = async (req, res) => {
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}

const AddUser = async (req, res) => {
    try {

        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const image = req.file.filename;
        const password = randomstring.generate(8);

        const spassword = await securePassword(password);

        const user = new User({
            name: name,
            email: email,
            phone: phone,
            image: image,
            password: spassword,
            is_admin: 0,
        })

        const userData = await user.save();

        if (userData) {
            await addUserMail(name, email, password, userData._id);
            res.redirect('/admin/dashboard');
        } else {
            res.render('new-user', {message: 'Something went wrong!'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

// edit user functionality
const EditUserLoad = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findById({_id: id});

        if (userData) {
            res.render('edit-user', {user: userData});
        } else {
            res.redirect('/admin/dashboard');
        }
    } catch (error) {
        console.log(error.message);
    }
}

const UpdateUser = async (req, res) => {
    try {

        const userData = await User.findByIdAndUpdate({_id: req.body.id}, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                is_verified: req.body.verify
            }
        })

        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error.message);
    }
}


// Delete User
const DeleteUser = async (req, res) => {
    try {

        const id = req.query.id;
        await User.deleteOne({_id: id});
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

// ----------------------------------------------------------------
//  JSON - Connect to Client
const AllAdmins = async (req, res) => {
    try {
        const users = await User.find({is_admin: 1})
        res.json(users);
    } catch (error) {
        res.send(error.message);
    }
}

const AdminLogin = async (req, res) => {
    const {email, password} = req.body;

    try {

        // // Tìm kiếm admin dựa trên email
        const admin = await User.findOne({email});

        // If admin doesn't exist, return an error
        if (admin.is_admin !== 1) {
            return res.status(401).json({message: 'Invalid email or password'});
        } else {
            // Compare the provided password with the hashed password stored in the database
            const passwordMatch = await bcrypt.compare(password, admin.password);

            // If passwords don't match, return an error
            if (!passwordMatch) {
                return res.status(401).json({message: 'Invalid email or password'});
            } else {
                // Create a JWT token
                const token = jwt.sign({adminId: admin._id}, process.env.JWT_SECRET);

                // Lưu thông tin người dùng trong session
                req.session.adminId = admin._id;

                res.json({token});
            }
        }

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({message: 'Server error'});
    }
}

const AdminLogout = async (req, res) => {
    // req.session.destroy((err) => {
    //     if (err) {
    //         console.error('Logout failed:', err);
    //         res.status(500).json({ message: 'Logout failed' });
    //     } else {
    //         res.json({ message: 'Logged out successfully' });
    //     }
    // });

    const {token} = req.body;

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({message: 'Invalid token'});
        }

        // Perform any necessary logout logic (e.g., removing tokens from the database, etc.)

        // Return a success message
        res.status(200).json({message: 'Logged out successfully'});
    });
};

const AdminAddUser = async (req, res) => {
    try {
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) {
            return res.status(400).json({message: 'Tài khoản đã tồn tại!'})
        } else {
            const password = randomstring.generate(8);

            // Mã hóa mật khẩu trước khi lưu vào csdl
            const hashedPassword = await securePassword(password);

            const user = new User({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                image: req.file.filename,
                password: hashedPassword,
                is_admin: 0,
            });

            // Lưu user vào csdl
            const userData = await user.save();

            if (userData) {
                await addUserMail(req.body.name, req.body.email, password, userData._id);
                return res.status(201).json({message: 'Add User Successfully!'})
            } else {
                return res.status(404).json({message: 'Add User Failure!'});
            }
        }

    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

//  Xóa tài khoản người dùng
const AdminDeleteUser = async (req, res) => {
    try {
        const deleteUser = await User.findOneAndRemove({_id: req.params._id});

        if (deleteUser) {
            // Delete user's image file
            const imagePath = path.join(__dirname, "../public/userImages", deleteUser.image);
            fs.unlinkSync(imagePath);
            res.status(200).send(`User ${req.params._id} deleted successfully!`);
        } else {
            res.status(404).send(`User ${req.params._id} not found!`)
        }

    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Sửa thông tin User
const AdminEditUser = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const phone = req.body.phone;
        const image = req.file.filename;

        const userId = req.params._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        // Delete the old photo if it exists
        if (user.image) {
            const imagePath = path.join(__dirname, '../public/userImages', user.image);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.log(err);
                }
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {name, email, phone, image},
            {new: true}
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const sendResetPasswordMailAdmin = async (name, email, token) => {
    try {
        const resetPasswordLink = `${BASE_ADMIN_URL}/admin/reset-password?token=${token}`;

        const transporter = nodemailer.createTransport({
            host: HOST,
            port: PORT,
            secure: false, // upgrade later with STARTTLS
            requireTLS: true,
            auth: {
                user: USERNAME, // Use environment variable for email username
                pass: PASSWORD, // Use environment variable for email password
            },
        });

        const MailOptions = {
            from: USERNAME, // Use the same email username as the sender
            to: email,
            subject: 'For Reset Password Admin',
            html: '<p>Hi <b>' + name + '</b>, please click here to ' +
                '<a href="' + resetPasswordLink + '"> Reset </a> ' +
                'your password.</p>',
        }

        transporter.sendMail(MailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email has been sent: ' + info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

const AdminForgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email});

        if (userData) {
            if (userData.is_admin === 0) {
                res.status(400).send({message: 'Email không đúng!!'});
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email: email}, {$set: {token: randomString}});
                await sendResetPasswordMailAdmin(userData.name, userData.email, randomString);
                res.status(200).send({message: 'Xin vui lòng check mail để reset lại mật khẩu!'});
            }
        } else {
            res.status(400).send({message: 'Email không đúng!!'});
        }

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}

const AdminResetPassword = async (req, res) => {
    try {

        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({_id: user_id}, {
            $set: {
                password: secure_password,
                token: ''
            }
        });

        res.status(200).json({message: 'Cập nhật mật khẩu thành công!'});

    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}


module.exports = {
    LoadLogin,
    VerifyLogin,
    LoadDashboard,
    Logout,
    ForgetLoad,
    ForgetVerify,
    ForgetPasswordLoad,
    ResetPassword,
    AdminDashboard,
    NewUserLoad,
    AddUser,
    EditUserLoad,
    UpdateUser,
    DeleteUser,
// JSON - Connect to Client
    AllAdmins,
    AdminLogin,
    AdminLogout,
    AdminAddUser,
    AdminEditUser,
    AdminDeleteUser,

    AdminForgetVerify,
    AdminResetPassword
}