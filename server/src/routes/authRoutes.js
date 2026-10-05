const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validatorMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', getMe);
router.post('/logout', logout);

module.exports = router;
