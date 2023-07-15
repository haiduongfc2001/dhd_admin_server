const express = require("express");

const admin_route = express();

const session = require("express-session");
const SessionSecret = require("../config/SessionSecret");
admin_route.use(
  session({
    secret: SessionSecret.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: true,
      maxAge: 60 * 60 * 1000, // 1 hour
    },
  })
);

const bodyParser = require("body-parser");
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({ extended: true }));

const path = require("path");
admin_route.set("view engine", "ejs");
admin_route.set("views", path.join(__dirname, "../views/admin"));

const multer = require("multer");
admin_route.use("/userImages", express.static("src/public/userImages"));

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

const AdminAuth = require("../middleware/AdminAuth");
const AdminController = require("../controllers/AdminController");
const { authAdmin } = require("../middleware/AdminAuth");
const Auth = require("../middleware/Auth");

// ----------------------------------------------------------------
// axios
admin_route.get("/admins", Auth.authenticateAdmin, AdminController.AllAdmins);
admin_route.post("/login", AdminController.AdminLogin);
admin_route.post(
  "/add-user",
  upload.single("image"),
  AdminController.AdminAddUser
);
admin_route.delete(
  "/delete-user",
  Auth.authenticateAdmin,
  AdminController.AdminDeleteUser
);

admin_route.post("/forget", AdminController.AdminForgetVerify);
admin_route.get("/forgot-password", AdminController.AdminResetPassword);
admin_route.post("/forgot-password", AdminController.AdminResetPassword);

admin_route.post(
  "/logout",
  //   Auth.authenticateAdmin,
  AdminController.AdminLogout
);

module.exports = admin_route;
