const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const fs = require("fs");

require("dotenv").config();
const {
  HOST,
  PORT,
  USERNAME,
  PASSWORD,
  BASE_URL,
  BASE_ADMIN_URL,
} = require("../config/MailConfig");

const path = require("path");

// <a href="http://127.0.0.1:3000/verify?id=' + user_id + '"> Verify </a>
// <a href="http://127.0.0.1:3000/forget-password?token=' + token + '"> Reset </a>

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (err) {
    console.log(err.message);
  }
};

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
      from: USERNAME,
      to: email,
      subject: "For Reset Password Admin",
      html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px;">
                  <p>Hi <b>${name}</b>,</p>
                  <p>Please click the link below to reset your password:</p>
                  <p>
                    <a 
                        href="${resetPasswordLink}" 
                        style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #0d6efd; 
                        color: #FFFFFF; text-decoration: none; border-radius: 5px;"
                    >
                    Reset Password
                    </a>
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
      from: USERNAME,
      to: email,
      subject: "Admin add you and verify your email",
      html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px;">
                  <p>Hi ${name},</p>
                  <p>Please click the link below to verify your email:</p>
                  <p>
                    <a 
                        href="${userVerificationLink}" 
                        style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                        background-color: #0d6efd; color: #FFFFFF; text-decoration: none; border-radius: 5px;"
                    >
                        Verify Email
                    </a>
                  </p>
                  <br>
                  <p>Here are your login credentials:</p>
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                  </ul>
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

// ----------------------------------------------------------------
//  JSON - Connect to Client
const AllAdmins = async (req, res) => {
  try {
    const users = await User.find({ is_admin: 1 });
    res.json(users);
  } catch (error) {
    res.send(error.message);
  }
};

const AdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Tìm kiếm admin dựa trên email
    const user = await User.findOne({ email });

    if (!user || user.is_admin !== 1) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không hợp lệ!" });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res
          .status(401)
          .json({ message: "Email hoặc mật khẩu không hợp lệ!" });
      } else {
        const payload = {
          user: {
            user_id: user._id,
            is_admin: user.is_admin,
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

            // Set session expiration time to 1 hour
            req.session.user_id = user._id;
            req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000);

            res
              .header("Authorization", `Bearer ${token}`)
              .status(200)
              .json(token);
          }
        );

        // Create a JWT token
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        //   expiresIn: "1h",
        // });
        // user.token = token;
        // await user.save();

        // // Lưu thông tin người dùng trong session
        req.session.user_id = user._id;
        req.session.cookie.expires = new Date(Date.now() + 60 * 60 * 1000);

        // res.status(200).json({ token });
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const AdminLogout = async (req, res) => {
  // req.session.destroy((err) => {
  //     if (err) {
  //         console.error('Logout failed:', err);
  //         res.status(500).json({ message: 'Logout failed' });
  //     } else {
  //         res.json({ message: 'Logged out successfully' });
  //     }
  // });

  // const {token} = req.body;
  //
  // // Verify the token
  // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  //     if (err) {
  //         return res.status(401).json({message: 'Invalid token'});
  //     }
  //
  //     // Perform any necessary logout logic (e.g., removing tokens from the database, etc.)
  //
  //     // Return a success message
  //     res.status(200).json({message: 'Logged out successfully'});
  // });

  // Xóa token khỏi session để đăng xuất
  delete req.session.token;
  res.status(200).json({ message: "Logged out successfully" });

  //   try {
  //     const user = await User.findById(req.user_id);
  //     if (!user) {
  //       return res.status(404).json({ message: "User not found" });
  //     }

  //     // Clear the token
  //     user.token = "";
  //     await user.save();

  //     res.status(200).json({ message: "Admin logged out successfully" });
  //   } catch (err) {
  //     res.status(500).json({ message: "Internal server error" });
  //   }
};

const AdminAddUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại!" });
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
        await addUserMail(
          req.body.name,
          req.body.email,
          password,
          userData._id
        );
        return res.status(201).json({ message: "Add User Successfully!" });
      } else {
        return res.status(404).json({ message: "Add User Failure!" });
      }
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Xóa tài khoản người dùng
const AdminDeleteUser = async (req, res) => {
  try {
    const deleteUser = await User.findOneAndRemove({ _id: req.params._id });

    if (deleteUser) {
      // Delete user's image file
      const imagePath = path.join(
        __dirname,
        "../public/userImages",
        deleteUser.image
      );
      fs.unlinkSync(imagePath);
      res.status(200).send(`User ${req.params._id} deleted successfully!`);
    } else {
      res.status(404).send(`User ${req.params._id} not found!`);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Sửa thông tin User
const AdminEditUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    // const image = req.file.filename;

    const user_id = req.params._id;
    const existingUser = await User.findById(user_id);

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the old photo if it exists
    // if (existingUser.image) {
    //     const imagePath = path.join(__dirname, '../public/userImages', existingUser.image);
    //     fs.unlink(imagePath, (err) => {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    // }

    // const updatedUser = await User.findByIdAndUpdate(
    //     user_id,
    //     {name, email, phone},
    //     {new: true}
    // );

    // existingUser.name = name;
    // existingUser.email = email;
    // existingUser.phone = phone;
    // existingUser.updatedAt = new Date();

    // const updatedUser = await existingUser.save();

    if (name) {
      existingUser.name = name;
    }

    if (email) {
      existingUser.email = email;
    }

    if (phone) {
      existingUser.phone = phone;
    }

    existingUser.updatedAt = new Date();

    const updatedUser = await existingUser.save();

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
      from: USERNAME,
      to: email,
      subject: "For Reset Password Admin",
      html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px;">
                  <p>Hi <b>${name}</b>,</p>
                  <p>Please click the link below to reset your password:</p>
                  <p>
                    <a 
                        href="${resetPasswordLink}" 
                        style="display: inline-block; margin-top: 10px; padding: 10px 20px; 
                        background-color: #0d6efd; color: #FFFFFF; text-decoration: none; border-radius: 5px;"
                    >
                        Reset Password
                    </a>
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

const AdminForgetVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      if (userData.is_admin === 0) {
        res.status(400).send({ message: "Email không đúng!!" });
      } else {
        const randomString = randomstring.generate();
        const updatedData = await User.updateOne(
          { email: email },
          { $set: { token: randomString } }
        );
        await sendResetPasswordMailAdmin(
          userData.name,
          userData.email,
          randomString
        );
        res
          .status(200)
          .send({ message: "Xin vui lòng check mail để reset lại mật khẩu!" });
      }
    } else {
      res.status(400).send({ message: "Email không đúng!!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const AdminResetPassword = async (req, res) => {
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
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  // JSON - Connect to Client
  AllAdmins,
  AdminLogin,
  AdminLogout,
  AdminAddUser,
  AdminEditUser,
  AdminDeleteUser,

  AdminForgetVerify,
  AdminResetPassword,
};
