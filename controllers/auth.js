const bcrypt = require('bcryptjs');

const User = require('../models/user');

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        pagetitle: 'Login'
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
                            res.redirect('/');
                        } else {
                            res.redirect('/login');
                            console.log('password incorrect');
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                res.redirect('/login');
                console.log('student not found');
            }
        }) 
        .catch(err => {
            console.log(err);
        });
};

exports.getSignup = (req, res) => {
    res.render('auth/signup', {
        pagetitle: 'Sign Up'
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
                                res.redirect('/');
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