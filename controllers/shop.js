const User = require('../models/user');
const Product = require('../models/product');

exports.getUserHomePage = (req, res, next) => {
    let username = req.session.username;
    let rollNo = req.params.rollNo;
    Product.find()
        .then(products => {
            res.render('main/home', {
                pagetitle: 'NIT Store',
                isLoggedIn: true,
                rollNo: rollNo,
                username: username,
                products: products
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getSellProduct = (req, res, next) => {
    const rollNo = req.params.rollNo;
    User.findOne({ rollNo: rollNo })
        .then(user => {
            res.render('shop/sellProduct', {
                pagetitle: 'Sell Product',
                isLoggedIn: true,
                rollNo: req.params.rollNo,
                username: req.session.username,
                mobile: user.mobile,
                email: user.email,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postSellProduct = (req, res, next) => {
    const rollNo = req.params.rollNo;
    const shortdesc = req.body.shortdesc;
    const sellerName = req.session.username;
    const price = req.body.price;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const description = req.body.description;
    const product = new Product({
        shortdesc: shortdesc,
        sellerName: sellerName,
        sellerRollNo: rollNo,
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

exports.getProductDetailPage = (req, res) => {
    console.log('product details');
    const product_id = req.params.product_id;
    const rollNo = req.params.rollNo;
    Product.findOne({
            _id: product_id
        })
        .then(product => {
            User.findOne({
                rollNo: product.sellerRollNo
            })
                .then(seller => {
                    res.render('shop/productDetail.ejs', {
                        pagetitle: 'Product Details',
                        isLoggedIn: true,
                        rollNo: rollNo,
                        username: req.session.username,
                        product: product,
                        seller: seller
                    });
                })
                .catch(err => {
                    console.log(err);
                });  
        })
        .catch(err => {
            console.log(err);
        });
};

exports.deleteNotifySeller = (req, res) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    Product.findOne({
        _id: product_id
    })
        .then(product => {
            User.updateOne({
                rollNo: product.sellerRollNo
            }, {
                    $push: {
                        notifications: {
                            title: 'Somebody is interested to buy your product'
                        }
                    }
                })
                .then(() => {
                    res.json({ message: 'Notified Successfully' });
                })
                .catch(err => {
                    console.log(err);
                });   
        })
        .catch(err => {
        console.log(err);
    })
};