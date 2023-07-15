const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const express = require("express");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");

require("dotenv").config(); // Add this line to load environment variables
const {
  HOST,
  PORT,
  USERNAME,
  PASSWORD,
  BASE_URL,
} = require("../config/MailConfig");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    console.log(err.message);
  }
};

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
      subject: "For Verification Mail",
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
    };

    transporter.sendMail(MailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent: " + info.response);
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
      subject: "For Reset Password",
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
        console.log("Email has been sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

const VerifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    // console.log(updateInfo);
    // res.render('email-verified');
  } catch (err) {
    console.log(err.message);
  }
};

// ----------------------------------------------------------------
// JSON - Connect to Client
const AllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate({
        path: "ratedMovies.movie",
        select: "id title",
      })
      .select("-password"); // loại bỏ trường "password"
    res.json(users);
  } catch (error) {
    res.send(error.message);
  }
};

const FindUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params._id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const UserRegister = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã tồn tại hay chưa
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Tài khoản đã tồn tại. Xin vui lòng đăng nhập!" });
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
        return res.status(200).json({
          message:
            "Xin vui lòng xác thực tài khoản trong tin nhắn được chúng tôi gửi trong email của bạn!",
        });
      } else {
        res.status(404).json({ message: "Đăng ký không thành công" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};

const UserVerifyMail = async (req, res) => {
  try {
    const updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    // res.render('email-verified');
    // res.redirect('/verify-success'); // Chuyển hướng đến trang thành công sau khi xác thực
  } catch (err) {
    res.status(500).json({ message: "Đã xảy ra lỗi" });
  }
};

const UserVerifyLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Bạn chưa đăng ký tài khoản" });
    }

    if (user.is_verified === 0) {
      return res.status(401).json({
        message:
          "Bạn chưa xác thực tài khoản. " +
          "Xin check mail được gửi đến để xác thực tài khoản",
      });
    }

    // So sánh mật khẩu được cung cấp với mật khẩu băm được lưu trữ trong cơ sở dữ liệu
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    const payload = {
      user: {
        user_id: user._id,
        email: email,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "30days" },
      async (err, token) => {
        if (err) throw err;

        // Cập nhật lại token trong cơ sở dữ liệu
        user.token = token;
        await user.save();

        res.header("Authorization", `Bearer ${token}`).json({
          message: "Logged in successfully",
          token,
          user_id: user._id,
          user: user,
        });
      }
    );

    // Lưu thông tin người dùng trong session
    req.session.token = user.token;
    req.session.user_id = user._id;
    req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000);
  } catch {
    return res.status(500).json({ message: "Server error" });
  }
};

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

  res.json({ message: "Logged out successfully" });
};

const UserForgetVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_verified === 1) {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );

        await sendResetPasswordMail(
          userData.name,
          userData.email,
          randomString
        );
        res
          .status(200)
          .send({ message: "Xin vui lòng check mail để reset lại mật khẩu!" });
      } else {
        res.status(401).json({
          message:
            "Bạn chưa xác thực tài khoản. " +
            "Xin check mail được gửi đến để xác thực tài khoản",
        });
      }
    } else {
      res.status(401).json({ message: "Bạn chưa đăng ký tài khoản!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const UserForgetPassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ token: token });

    if (tokenData) {
      res.status(200).json({ user_id: tokenData._id });
    } else {
      res.status(404).json({ message: "Token không đúng" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const UserResetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const user_id = req.body.user_id;

    const secure_password = await securePassword(password);
    const updatedData = await User.findByIdAndUpdate(
      { _id: user_id },
      {
        $set: {
          password: secure_password,
          token: "",
        },
      }
    );

    res.status(200).json({ message: "Cập nhật mật khẩu thành công!" });

    // res.redirect('http://localhost:3000/login');
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const UserEditProfile = async (req, res) => {
  try {
    // const name = req.body.name;
    // const phone = req.body.phone;

    const { name, phone } = req.body;

    const user_id = req.params._id;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { name, phone, updatedAt: Date.now() },
      { new: true }
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
    res.status(500).json({ message: "Server error" });
  }
};

const UserEditImage = async (req, res) => {
  try {
    const user_id = req.params._id;
    const image = req.file.filename;

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Xóa ảnh cũ nếu người dùng update ảnh mới
    if (user.image) {
      const imagePath = path.join(
        __dirname,
        "../public/userImages",
        user.image
      );
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    user.image = image;
    user.updatedAt = Date.now();

    const updatedUser = await user.save();

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const UserCountStatus = async (req, res) => {
  try {
    const users = await User.find();

    if (!users.length) {
      res.status(404).json({ message: "No users found!" });
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
      adminCount,
      usersCount,
      notVerifiedCount,
    };

    res.json(userCount);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  VerifyMail,
  AllUsers,
  //----------------------------
  FindUserById,
  UserRegister,
  UserVerifyMail,
  UserVerifyLogin,
  Logout,
  UserForgetVerify,
  UserForgetPassword,
  UserResetPassword,
  UserEditProfile,
  UserEditImage,
  UserCountStatus,
};
