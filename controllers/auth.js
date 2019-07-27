const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
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