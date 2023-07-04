const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const express = require('express');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

require('dotenv').config(); // Add this line to load environment variables
const {HOST, PORT, USERNAME, PASSWORD, BASE_URL} = require("../config/MailConfig");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const securePassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (err) {
        console.log(err.message);
    }
}

// For send mail
const sendVerifyMail = async (name, email, user_id) => {
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
            subject: 'For Verification Mail',
            text: "Plaintext version of the message",
            // html: '<p>Hi <b>'+name+'</b>, please click here to <a href="http://127.0.0.1:5000/verify?id=' + user_id + '"> Verify </a> your mail.</p>',

            html: `
                <p style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
                  Xin chào <strong style="color: #0000FF;">${name}</strong>, xin vui lòng nhấp vào ô bên dưới 
                  để xác thực tài khoản của bạn.
                </p>
                <p>
                  <a 
                      href="${userVerificationLink}" 
                      style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #0d6efd; 
                      color: #FFFFFF; text-decoration: none; border-radius: 5px;"
                  >
                    Verify
                  </a>
                </p>
              `,
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

// Gửi mail lấy lại mật khẩu đã quên
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const resetPasswordLink = `${BASE_URL}/reset-password?token=${token}`;

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
            from: USERNAME,
            to: email,
            subject: 'For Reset Password Admin',
            html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px;">
                  <p style="margin-bottom: 20px;">Hi <b>${name}</b>,</p>
                  <p style="margin-bottom: 20px;">
                    Please click the link below to reset your password:
                  </p>
                  <p style="margin-bottom: 20px;">
                    <a 
                        href="${resetPasswordLink}" 
                        style="display: inline-block; padding: 10px 20px; background-color: #0d6efd; 
                        color: #FFFFFF; text-decoration: none; border-radius: 5px;"
                    >
                        Reset Password
                    </a>
                  </p>
                  <p style="margin-bottom: 0;">
                    If you did not request a password reset, please ignore this email.
                  </p>
                </div>
              `,
        };


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

const LoadRegister = async (req, res) => {
    try {
        res.render('registration');
    } catch (err) {
        console.log(err.message);
    }
}

const AddUser = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password)

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename,
            password: spassword,
            is_admin: 0,
        });

        const userData = await user.save();

        if (userData) {
            await sendVerifyMail(req.body.name, req.body.email, userData._id);
            res.render('registration', {message: 'Your registration has been successfully! Please check your email!'});
        } else {
            res.render('registration', {message: 'Your registration has been failed!'});
        }

    } catch (err) {
        res.send(err.message);
    }
};

const VerifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({_id: req.query.id}, {$set: {is_verified: 1}});
        // console.log(updateInfo);
        // res.render('email-verified');
    } catch (err) {
        console.log(err.message);
    }
};

// Login user method
const LoginLoad = async (req, res) => {
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
                if (userData.is_verified === 0) {
                    res.render('login', {message: 'Please verify your mail!'});
                } else {
                    req.session.user_id = userData._id;
                    res.redirect('/home');
                }
            } else {
                res.render('login', {message: 'Email and passsword is incorrect'});
            }
        } else {
            res.render('login', {message: 'Email and passsword is incorrect'});
        }

    } catch (error) {
        console.log(error.message);
    }
}

const LoadHome = async (req, res) => {
    try {
        const userData = await User.findById({_id: req.session.user_id})
        res.render('home', {user: userData});
    } catch (error) {
        console.log(error.message)
    }
}

const UserLogout = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/');
    } catch (error) {
        console.log(error.message)
    }
}

// Forget Password
const ForgetLoad = async (req, res) => {
    try {
        res.render('forget');
    } catch (error) {
        console.log(error.message)
    }
}

// Forget Verify
const ForgetVerify = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await User.findOne({email: email});

        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', {message: 'Xin check mail để xác thực đăng ký!'})
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email: email}, {$set: {token: randomString}});
                await sendResetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget',
                    {message: 'Xin vui lòng check mail để reset lại mật khẩu!'}
                )
            }
        } else {
            res.render(
                'forget',
                {message: 'Email của bạn chưa được đăng ký! Xin đăng ký tài khoản!'}
            )
        }

    } catch (error) {
        console.log(error.message)
    }
}

const ForgetPasswordLoad = async (req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await User.findOne({token: token});
        if (tokenData) {
            // res.render('forget-password', {user_id: tokenData._id});
            res.redirect('http://localhost:3000/reset-password', {user_id: tokenData._id});
        } else {
            res.render('404', {message: 'Token không đúng'});
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

        res.redirect('/');

    } catch (error) {
        console.log(error.message);
    }
}

// For verification send mail link
const VerificationLoad = async (req, res) => {
    try {
        res.render('verification', {message: 'Verification'})
    } catch (error) {
        console.log(error.message);
    }
}

const SendVerificationLink = async (req, res) => {
    try {

        const email = req.body.email;
        const userData = await User.findOne({email: email});
        if (userData) {
            sendVerifyMail(userData.name, userData.email, userData._id);
            res.render('verification', {message: 'Reset verification mail sent your mail id, please check!'})
        } else {
            res.render('verification', {message: 'This email is not exist'})
        }

    } catch (error) {
        console.log(error.message);
    }
}

// User profile edit & update
const EditLoad = async (req, res) => {
    try {

        const id = req.query.id;
        const userData = await User.findById({_id: id});

        if (userData) {
            res.render('edit', {user: userData});
        } else {
            res.redirect('/home');
        }

    } catch (error) {
        console.log(error.message);
    }
}


const UpdateProfile = async (req, res) => {
    try {
        let updateData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const userData = await User.findByIdAndUpdate(
            {_id: req.body.user_id},
            {$set: updateData}
        );

        res.redirect('/home');
    } catch (error) {
        console.log(error.message);
    }
};

// const UpdateProfile = async (req, res) => {
//     try {
//
//         if (req.file) {
//             const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, phone: req.body.phone, image: req.file.filename}})
//         } else {
//             const userData = await User.findByIdAndUpdate({_id: req.body.user_id}, {$set: {name: req.body.name, email: req.body.email, phone: req.body.phone}})
//         }
//
//         res.redirect('/home.ejs')
//
//     } catch (error) {
//         console.log(error.message);
//     }
// }

// ----------------------------------------------------------------
// JSON - Connect to Client
const AllUsers = async (req, res) => {
    try {
        const users = await User.find().populate({
            path: 'ratedMovies.movie',
            select: 'id title'
        });
        res.json(users);
    } catch (error) {
        res.send(error.message);
    }
}

const FindUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params._id);

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({message: 'User not found'});
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const UserRegister = async (req, res) => {
    try {
        // Kiểm tra xem người dùng đã tồn tại hay chưa
        const existingUser = await User.findOne({email: req.body.email});
        if (existingUser) {
            return res.status(401).json({message: 'Tài khoản đã tồn tại. Xin vui lòng đăng nhập!'});
        } else {
            // Mã hóa mật khẩu trước khi lưu vào csdl
            const hashedPassword = await securePassword(req.body.password);

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
                await sendVerifyMail(req.body.name, req.body.email, userData._id);
                return res
                    .status(200)
                    .json({message: 'Xin vui lòng xác thực tài khoản trong tin nhắn được chúng tôi gửi trong email của bạn!'});
            } else {
                res.status(404).json({message: 'Đăng ký không thành công'})
            }
        }

    } catch (error) {
        res.status(500).json({message: 'Đã xảy ra lỗi'});
    }
}

const UserVerifyMail = async (req, res) => {
    try {
        const updateInfo = await User.updateOne({_id: req.query.id}, {$set: {is_verified: 1}});
        console.log(updateInfo);
        // res.render('email-verified');
        // res.redirect('/verify-success'); // Chuyển hướng đến trang thành công sau khi xác thực
    } catch (err) {
        res.status(500).json({message: 'Đã xảy ra lỗi'});
    }
};

const UserVerifyLogin = async (req, res) => {
    try {

        const {email, password} = req.body;

        const userData = await User.findOne({email});

        if (!userData) {
            return res.status(401).json({message: 'Bạn chưa đăng ký tài khoản'});
        } else {
            if (userData.is_verified === 0) {
                return res.status(401).json({
                    message: 'Bạn chưa xác thực tài khoản. ' +
                        'Xin check mail được gửi đến để xác thực tài khoản'
                });
            } else {
                // Compare the provided password with the hashed password stored in the database
                const passwordMatch = await bcrypt.compare(password, userData.password);

                // If passwords don't match, return an error
                if (!passwordMatch) {
                    return res.status(401).json({message: 'Email hoặc mật khẩu không đúng!'});
                } else {
                    // Create a JWT token
                    const token = await jwt.sign(
                        {user_id: userData._id, email: email},
                        process.env.JWT_SECRET, {
                            expiresIn: '1h'
                        }
                    );

                    // Lưu thông tin người dùng trong session
                    // req.session.adminId = userData._id;
                    req.session.token = token;
                    req.session.user_id = userData._id;

                    res.status(200)
                        .header('Authorization', `Bearer ${token}`)
                        .status(200).json({
                        message: 'Logged in successfully',
                        token,
                        user_id: userData._id,
                        user: userData
                    });

                    // return res.status(200)
                    //     .json({message: 'Logged in successfully', token, user_id: userData._id, user: userData});
                }
            }
        }
    } catch {
        return res.status(500).json({message: 'Server error'});
    }
}

const Logout = async (req, res) => {
    // const {token} = req.body;
    //
    // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    //     if (err) {
    //         return res.status(401).json({message: 'Invalid Token'});
    //     }
    //
    //     res.status(200).json({message: 'Logged out successfully'});
    //
    // })

    // Xóa token khỏi session để đăng xuất
    delete req.session.token;

    res.json({message: 'Logged out successfully'});

}

const UserForgetVerify = async (req, res) => {
    try {

        const {email} = req.body;
        const userData = await User.findOne({email: email});

        if (userData) {
            if (userData.is_verified === 1) {

                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({email: email}, {$set: {token: randomString}});

                await sendResetPasswordMail(userData.name, userData.email, randomString);
                res.status(200).send({message: 'Xin vui lòng check mail để reset lại mật khẩu!'})

            } else {
                res.status(401).json({
                    message: 'Bạn chưa xác thực tài khoản. ' +
                        'Xin check mail được gửi đến để xác thực tài khoản'
                });
            }
        } else {
            res.status(401).json({message: 'Bạn chưa đăng ký tài khoản!'});
        }

    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
}

const UserForgetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({token: token});

        if (tokenData) {
            res.status(200).json({user_id: tokenData._id});
        } else {
            res.status(404).json({message: 'Token không đúng'});
        }
    } catch (error) {
        res.status(500).json({message: 'Server error'});
    }
}

const UserResetPassword = async (req, res) => {
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

        // res.redirect('http://localhost:3000/login');

    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
}

const UserEditProfile = async (req, res) => {
    try {

        // const name = req.body.name;
        // const phone = req.body.phone;

        const {name, phone} = req.body;

        const userId = req.params._id;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {name, phone, updatedAt: Date.now()},
            {new: true}
        );

        // await updatedUser.save();

        res.status(200).json(updatedUser);

        // const { name, phone } = req.body;
        // const image = req.file.filename;
        // const user_id = req.params._id;
        //
        // const user = await User.findById({user_id});
        //
        // if (!user) {
        //     res.status(404).json({message: 'User not found'});
        // }
        //
        // // Xóa ảnh cũ nếu người dùng update ảnh mới
        // if (user.image) {
        //     const imagePath = path.join(__dirname, '../public/userImages', user.image);
        //     fs.unlink(imagePath, (err) => {
        //         if (err) {
        //             console.log(err);
        //         }
        //     });
        // };
        //
        // const updatedUser = await User.findByIdAndUpdate(
        //     user_id,
        //     { name, phone, image },
        //     { new: true }
        // );
        //
        // res.status(200).json({ message: 'Thay đổi thông tin thành công!', updatedUser});

    } catch (err) {
        res.status(500).json({message: 'Server error'});
    }
}

const UserCountStatus = async (req, res) => {
    try {

        const users = await User.find();

        if (!users.length) {
            res.status(404).json({message: 'No users found!'})
        }

        let adminCount = 0;
        let usersCount = 0;
        let notVerifiedCount = 0;

        for (const user of users) {
            if (user.is_admin === 1) {
                adminCount += 1;
            } else if (user.is_admin === 0 && user.is_verified === 1) {
                usersCount += 1;
            } else {
                notVerifiedCount += 1;
            }
        }

        const userCount = {
            adminCount, usersCount, notVerifiedCount
        }

        res.json(userCount);

    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Server error'});
    }
}


module.exports = {
    LoadRegister,
    VerifyMail,
    AllUsers,
    LoginLoad,
    VerifyLogin,
    LoadHome,
    UserLogout,
    ForgetLoad,
    ForgetVerify,
    ForgetPasswordLoad,
    ResetPassword,
    VerificationLoad,
    SendVerificationLink,
    EditLoad,
    UpdateProfile,
    //----------------------------
    AddUser,
    FindUserById,
    UserRegister,
    UserVerifyMail,
    UserVerifyLogin,
    Logout,
    UserForgetVerify,
    UserForgetPassword,
    UserResetPassword,
    UserEditProfile,
    UserCountStatus
}