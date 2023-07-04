const express = require('express');

const admin_route = express();

const session = require("express-session");
const SessionSecret = require('../config/SessionSecret')
admin_route.use(session({
    secret: SessionSecret.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true}));

const path = require("path");
admin_route.set('view engine', 'ejs');
admin_route.set('views', path.join(__dirname, '../views/admin'));

const multer = require("multer");
admin_route.use('/userImages', express.static('src/public/userImages'));

const storage = multer.diskStorage({
    destination: function (req, res, cb) {
        cb(null, path.join(__dirname, '../public/userImages'))
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
})
const upload = multer({storage: storage});

const AdminAuth = require('../middleware/AdminAuth')
const AdminController = require('../controllers/AdminController');
const UserController = require("../controllers/UserController");
const User = require("../models/UserModel");
const bcrypt = require("bcrypt");
const {authAdmin} = require("../middleware/AdminAuth");
const randomstring = require("randomstring");
const nodemailer = require("nodemailer");
const {HOST, PORT, USERNAME, PASSWORD} = require("../config/MailConfig");
const Auth = require("../middleware/Auth");

// admin_route.get('/', AdminAuth.isLogout, AdminController.LoadLogin);
// admin_route.post('/', AdminController.VerifyLogin);
//
// admin_route.get('/home', AdminAuth.isLogin, AdminController.LoadDashboard);
//
// admin_route.get('/logout', AdminAuth.isLogin, AdminController.Logout);
//
// admin_route.get('/forget', AdminAuth.isLogout, AdminController.ForgetLoad);
// admin_route.post('/forget', AdminController.ForgetVerify);
//
// admin_route.get('/forget-password', AdminAuth.isLogout, AdminController.ForgetPasswordLoad);
// admin_route.post('/forget-password', AdminController.ResetPassword);
//
// admin_route.get('/dashboard', AdminAuth.isLogin, AdminController.AdminDashboard);
//
// admin_route.get('/new-user', AdminAuth.isLogin, AdminController.NewUserLoad);
// admin_route.post('/new-user', upload.single('image'), AdminController.AddUser);
//
// admin_route.get('/edit-user', AdminAuth.isLogin, AdminController.EditUserLoad);
// admin_route.post('/edit-user', AdminController.UpdateUser);
//
// admin_route.get('/delete-user', AdminAuth.isLogin, AdminController.DeleteUser);
//
// admin_route.get('*', (req, res) => {
//     res.redirect('/admin');
// });

// ----------------------------------------------------------------
// axios
admin_route.get('/admins', AdminController.AllAdmins);
admin_route.post('/login', AdminController.AdminLogin);
admin_route.post('/add-user', upload.single('image'), AdminController.AdminAddUser);
admin_route.delete('/delete-user', AdminController.AdminDeleteUser);

admin_route.post('/forget', AdminController.AdminForgetVerify);
admin_route.get('/forgot-password', AdminController.AdminResetPassword);
admin_route.post('/forgot-password', AdminController.AdminResetPassword);

admin_route.post('/logout', AdminController.AdminLogout);

module.exports = admin_route;





















