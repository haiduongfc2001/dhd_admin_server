const express = require('express');
const userRegisterRoute = express();

const UserRegisterController = require('../controllers/UserRegisterController');
const path = require("path");

const bodyParser = require('body-parser');
userRegisterRoute.use(bodyParser.json());
userRegisterRoute.use(bodyParser.urlencoded({ extended: true }));

userRegisterRoute.set('view engine', 'pug');
userRegisterRoute.set('views', path.join(__dirname, '../views'))

userRegisterRoute.get('/user/register', (req, res) => {
    res.render('UserRegister')
})

userRegisterRoute.post('/user/register', UserRegisterController.AddUser);

module.exports = userRegisterRoute;