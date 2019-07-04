const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    }
}));

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pagetitle: 'Login',
        isLoggedIn: false,
        loginError: req.flash('loginError'),
        csrfToken: req.csrfToken()
    });
};

exports.postLogin = (req, res) => {
    const rollNo = req.body.rollNo;
    const password = req.body.password;
    User.findOne({ rollNo: rollNo })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password)
                    .then(passwordMatch => {
                        if (passwordMatch) {
                            req.session.isLoggedIn = true;
                            req.session.rollNo = user.rollNo;
                            res.redirect('/' + user.rollNo);
                        } else {
                            req.flash('loginError', 'Incorrect Password!')
                            res.redirect('/login');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                req.flash('loginError', 'User Not Registed!');
                res.redirect('/login');
            }
        }) 
        .catch(err => {
            console.log(err);
        });
};

exports.getSignup = (req, res) => {
    res.render('auth/signup', {
        pagetitle: 'Sign Up',
        isLoggedIn: false,
        signupError: req.flash('signupError'),
        csrfToken: req.csrfToken()
    });
};

exports.postSignup = (req, res) => {
    const name = req.body.name;
    const rollNo = req.body.rollNo;
    const semester = req.body.semester;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const password = req.body.password;
    User.findOne({ rollNo: rollNo })
        .then(user => {
            if (user) {
                console.log('User already exists!');
                req.flash('signupError', 'User already registered!');
                res.redirect('/signup');
            } else {
                bcrypt.hash(password, 12)
                    .then(hashedPassword => {
                        const user = new User({
                            name: name,
                            rollNo: rollNo,
                            semester: semester,
                            email: email,
                            mobile: mobile,
                            password: hashedPassword
                        });
                        return user;
                    })
                    .then(user => {
                        user.save()
                            .then(result => {
                                res.redirect('/login');
                                return transporter.sendMail({
                                    to: email,
                                    from: 'nitstore@nitkkr.com',
                                    subject: 'Signup Succeeded!',
                                    html: '<h1>Your account have been created successfully!</h1><br><p>Thank You for using NITStore :)</p>'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        // console.log(err);
    });
    res.redirect('/');
};