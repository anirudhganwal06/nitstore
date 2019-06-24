const User = require('../models/user');
const Product = require('../models/product');

exports.getUserHomePage = (req, res, next) => {
    let username = req.session.username;
    let rollNo = req.params.rollNo;
    res.render('main/home', {
        pagetitle: 'NIT Store',
        isLoggedIn: true,
        username: username,
        rollNo: rollNo
    });
};

exports.getSellProduct = (req, res, next) => {
    const rollNo = req.params.rollNo;
    User.findOne({ rollNo: rollNo })
        .then(user => {
            res.render('shop/sellProduct', {
                pagetitle: 'Sell Product',
                username: req.session.username,
                mobile: user.mobile,
                email: user.email,
                rollNo: req.params.rollNo,
                isLoggedIn: true
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postSellProduct = (req, res, next) => {
    const rollNo = req.params.rollNo;
    const name = req.body.name;
    const price = req.body.price;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const description = req.body.description;
    const product = new Product({
        name: name,
        price: price,
        mobile: mobile,
        email: email,
        description: description
    });
    product.save()
        .then(result => {
            res.redirect('/' + rollNo);
        })
        .catch(err => {
            console.log(err);
        });

};