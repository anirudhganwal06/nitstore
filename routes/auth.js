const express = require('express');

const router = express.Router();

const authController = require('../controllers/auth');
const isAuth = require('../middlewares/isAuth');
const isNotAuth = require('../middlewares/isNotAuth');

router.get('/login', isNotAuth, authController.getLogin);

router.post('/login', isNotAuth, authController.postLogin);

router.get('/signup', isNotAuth, authController.getSignup);

router.post('/signup', isNotAuth, authController.postSignup);

router.get('/:rollNo/change-password', isAuth, authController.getChangePassword);

router.post('/:rollNo/change-password', isAuth, authController.postChangePassword);

router.post('/:rollNo/send-otp', authController.postSendOtp);

router.post('/:rollNo/forgot-password', authController.postForgotPassword);

router.get('/get-rollNo', isNotAuth, authController.getRollNo);

router.post('/get-rollNo', isNotAuth, authController.postGetRollNo);

router.post('/:rollNo/logout', isAuth, authController.postLogout);

module.exports = router;