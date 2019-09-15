// importing third party packages
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

// loading the user model
const User = require('../models/user');

// configuring nodemailer for sending emails
const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pagetitle: 'Login',
        isLoggedIn: false,
        loginError: req.flash('loginError'),
        csrfToken: req.csrfToken()
    });
};

exports.postLogin = async (req, res, next) => {
    const rollNo = req.body.rollNo;
    const password = req.body.password;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                req.session.isLoggedIn = true;
                req.session.rollNo = user.rollNo;
                res.redirect('/' + user.rollNo);
            } else {
                req.flash('loginError', 'Incorrect Password!')
                res.redirect('/login');
            }
        } else {
            req.flash('loginError', 'User Not Registed!');
            res.redirect('/login');
        }
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pagetitle: 'Sign Up',
        isLoggedIn: false,
        signupError: req.flash('signupError'),
        csrfToken: req.csrfToken()
    });
};

exports.postSignup = async (req, res, next) => {
    const name = req.body.name;
    const rollNo = req.body.rollNo;
    const semester = req.body.semester;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    const user = await User.findOne({
        rollNo: rollNo
    });
    try {
        if (user) {
            req.flash('signupError', 'User already registered!');
            res.redirect('/signup');
        } else {
            const hashedPassword = await bcrypt.hash(password, 12);
            const user = new User({
                name: name,
                rollNo: rollNo,
                semester: semester,
                email: email,
                mobile: mobile,
                password: hashedPassword
            });
            await user.save();
            res.redirect('/login');
            transporter.sendMail({
                to: email,
                from: 'nitstore@nitkkr.com',
                subject: 'Signup Succeeded!',
                html: '<h1>Your account have been created successfully!</h1><br><p>Thank You for using NITStore :)</p>'
            });
        }
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
    });
    res.redirect('/');
};

exports.getChangePassword = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const user = await User.findOne({
        rollNo: rollNo
    });
    res.render('auth/changePassword', {
        pagetitle: 'Change Password',
        isLoggedIn: true,
        rollNo: rollNo,
        username: user.name,
        numberOfNewNotifications: user.numberOfNewNotifications,
        incorrectOldPasswordError: req.flash('incorrectOldPasswordError'),
        csrfToken: req.csrfToken()
    });
};

exports.postChangePassword = async (req, res, next) => {
    try {
        const rollNo = req.params.rollNo;
        const user = await User.findOne({ rollNo: rollNo });
        const oldPassword = req.body.oldPassword;
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (passwordMatch) {
            const newPassword = req.body.newPassword;
            const newHashed = await bcrypt.hash(newPassword, 12);
            await User.updateOne({
                rollNo: rollNo
            }, {
                password: newHashed
            });
            transporter.sendMail({
                to: user.email,
                from: 'nitstore@nitkkr.com',
                subject: 'Password Changed!',
                html: '<h2>Your password has been changed successfully!</h2><br><p>Thank You for using NITStore :)</p>'
            });
            res.redirect('/' + rollNo + '/my-account');
        } else {
            req.flash('incorrectOldPasswordError', 'Incorrect Password!');
            res.redirect('/' + rollNo + '/change-password');
        }
    } catch {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postSendOtp = async (req, res, next) => {
    try {
        const rollNo = req.params.rollNo;
        const user = await User.findOne({
            rollNo: rollNo
        });
        const otp = Math.floor(100000 + Math.random() * 900000);
        await transporter.sendMail({
            to: user.email,
            from: 'nitstore@nitkkr.com',
            subject: 'Forgot Password!',
            html: '<h4>Enter the below OTP in the redirected page of the website</h4><br><h3>OTP : ' + otp + '</h3><br><p>Thank You for using NITStore :)</p>'
        });
        res.render('auth/forgotPassword', {
            pagetitle: 'Forgot Password',
            isLoggedIn: req.session.isLoggedIn,
            rollNo: rollNo,
            username: user.name,
            userEmail: user.email,
            numberOfNewNotifications: user.numberOfNewNotifications,
            incorrectOTPError: req.flash('incorrectOTPError'),
            sentOTP: otp,
            csrfToken: req.csrfToken()
        });
    } catch {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postForgotPassword = async (req, res, next) => {
    try {
        const rollNo = req.params.rollNo;
        const sentOTP = req.body.sentOTP;
        const otp = req.body.otp;
        const user = await User.findOne({ rollNo: rollNo });
        if (otp == sentOTP) {
            const newPassword = req.body.newPassword;
            const newHashed = await bcrypt.hash(newPassword, 12);
            await User.updateOne({
                rollNo: rollNo
            }, {
                password: newHashed
            });
            transporter.sendMail({
                to: user.email,
                from: 'nitstore@nitkkr.com',
                subject: 'Password Changed!',
                html: '<h2>Your password has been changed successfully!</h2><br><p>Thank You for using NITStore :)</p>'
            });
            res.redirect('/' + rollNo + '/my-account');
        } else {
            req.flash('incorrectOTPError', 'Incorrect OTP! Another OTP is sent to your email address.');
            res.redirect('/' + rollNo + '/forgot-password');
        }
    } catch {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getRollNo = (req, res) => {
    res.render('auth/getRollNo', {
        pagetitle: 'Provide Roll Number',
        isLoggedIn: false,
        getRollNoError: req.flash('getRollNoError'),
        csrfToken: req.csrfToken()
    });
}

exports.postGetRollNo = async (req, res) => {
    const rollNo = req.body.rollNo;
    const user = await User.findOne({
        rollNo: rollNo
    });
    if (user) {
        res.redirect(307, '/' + rollNo + '/send-otp');
    } else {
        req.flash('getRollNoError', 'No account found for Roll Number: ' + rollNo);
        res.redirect('/get-rollNo');
    }
}

