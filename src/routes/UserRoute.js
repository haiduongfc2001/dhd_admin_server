const express = require("express");
const user_route = express();

const session = require("express-session");
const SessionSecret = require("../config/SessionSecret");
user_route.use(
  session({
    secret: SessionSecret.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

const Auth = require("../middleware/Auth");
const User = require("../models/UserModel");

const UserController = require("../controllers/UserController");
const AdminController = require("../controllers/AdminController");

const path = require("path");
user_route.set("view engine", "ejs");
user_route.set("views", path.join(__dirname, "../views/users"));

const bodyParser = require("body-parser");
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({ extended: true }));

const multer = require("multer");
const { authMiddleware } = require("../middleware/Auth");
user_route.use("/userImages", express.static("src/public/userImages"));

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

// axios
user_route.get(
  "/users",
  //  Auth.authenticateAdmin,
  UserController.AllUsers
);
user_route.get("/user/:_id", UserController.FindUserById);
// user_route.post('/user/:_id', UserController.FindUserById);
user_route.put("/user/:_id", AdminController.AdminEditUser);
user_route.delete("/user/:_id", AdminController.AdminDeleteUser);

user_route.post(
  "/register",
  upload.single("image"),
  UserController.UserRegister
);
user_route.get("/verify", UserController.VerifyMail);

// user_route.get('/login', UserController.UserVerifyLogin);
user_route.post("/login", UserController.UserVerifyLogin);

user_route.get("/logout", UserController.Logout);

user_route.post("/forget", UserController.UserForgetVerify);

user_route.get("/forget-password", UserController.UserForgetPassword);
user_route.post("/forget-password", UserController.UserResetPassword);

user_route.put(
  "/edit-profile/:_id/image",
  upload.single("image"),
  UserController.UserEditImage
);
user_route.put("/edit-profile/:_id", UserController.UserEditProfile);

user_route.get("/users/count-status", UserController.UserCountStatus);

module.exports = user_route;
