// const express = require('express');
//
// const admin_route = express();
//
// const session = require("express-session");
// const SessionSecret = require('../config/SessionSecret')
// admin_route.use(session({
//     secret: SessionSecret.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true }
// }));
//
// const bodyParser = require('body-parser');
// admin_route.use(bodyParser.json());
// admin_route.use(bodyParser.urlencoded({ extended: true}));
//
// const AdminController = require('../controllers/AdminController');
// const Auth = require("../middleware/Auth");
//
// admin_route.post('/login', Auth.isAdminLogin, AdminController.AdminLogin);
// admin_route.post('/logout', AdminController.AdminLogout);
//
// module.exports = admin_route;