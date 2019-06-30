const User = require('../models/user');
const Product = require('../models/product');

exports.getUserHomePage = (req, res, next) => {
    let rollNo = req.params.rollNo;
    User.findOne({
        rollNo: rollNo
    }).then(user => {
        Product.find()
            .then(products => {
                res.render('main/home', {
                    pagetitle: 'NIT Store',
                    isLoggedIn: true,
                    rollNo: rollNo,
                    username: user.name,
                    numberOfNewNotifications: user.numberOfNewNotifications,
                    products: products
                });
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });
};

exports.getSellProduct = (req, res, next) => {
    const rollNo = req.params.rollNo;
    User.findOne({
            rollNo: rollNo
        })
        .then(user => {
            res.render('shop/sellProduct', {
                pagetitle: 'Sell Product',
                isLoggedIn: true,
                rollNo: req.params.rollNo,
                username: user.name,
                numberOfNewNotifications: user.numberOfNewNotifications,
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
    const price = req.body.price;
    const imageURL = req.file.url;
    const imagePublicId = req.file.public_id;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const description = req.body.description;
    const createdOn = new Date();
    User.findOne({
        rollNo: rollNo
    }).then(user => {
        const product = new Product({
            shortdesc: shortdesc,
            sellerName: user.name,
            sellerRollNo: rollNo,
            price: price,
            imageURL: imageURL,
            imagePublicId: imagePublicId,
            mobile: mobile,
            email: email,
            description: description,
            createdOn: createdOn
        });
        product.save()
            .then(result => {
                res.redirect('/' + rollNo);
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });
};

exports.getNotifications = (req, res) => {
    const rollNo = req.params.rollNo;
    User.findOneAndUpdate({
        rollNo: rollNo
    }, {
        numberOfNewNotifications: 0
    }, {
        new: false
    }, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            res.render('main/userNotifications', {
                pagetitle: 'Notifications',
                isLoggedIn: true,
                rollNo: rollNo,
                username: user.name,
                numberOfNewNotifications: user.numberOfNewNotifications,
                notifications: user.notifications,
                
            });
        }
    });
};

exports.getProductDetailPage = (req, res) => {
    const product_id = req.params.product_id;
    const rollNo = req.params.rollNo;
    User.findOne({
        rollNo: rollNo
    }).then(user => {
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
                            username: user.name,
                            numberOfNewNotifications: user.numberOfNewNotifications,
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
    }).catch(err => {
        console.log(err);
    });
};

exports.deleteNotifySeller = (req, res) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    User.findOne({
            rollNo: rollNo
        })
        .then(user => {
            let flag = 0;
            for (let prod_id of user.productsOfInterest) {
                if (prod_id === product_id) {
                    flag = 1;
                    res.json({
                        message: "Seller is already notified about your presence!"
                    });
                    break;
                }
            }
            if (flag === 0) {
                Product.findOne({
                        _id: product_id
                    })
                    .then(product => {
                        User.updateOne({
                                rollNo: product.sellerRollNo
                            }, {
                                $push: {
                                    notifications: {
                                        notificationTime: Date.now(),
                                        type: 'interestedBuyer',
                                        buyerRollNo: rollNo,
                                        buyerName: user.name,
                                        product_id: product_id
                                    }
                                },
                                $inc: {
                                    numberOfNewNotifications: 1
                                }
                            })
                            .then(() => {
                                User.updateOne({
                                        rollNo: rollNo
                                    }, {
                                        $push: {
                                            productsOfInterest: product_id
                                        }
                                    }).then(user => {
                                        res.json({
                                            message: 'Seller is notified about your interest!'
                                        });
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    });
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    })
            }
        })
        .catch(err => {
            console.log(err);
        })

};

exports.getAnotherUserProfile = (req, res) => {
    const rollNo = req.params.rollNo;
    const anotherUserRollNo = req.params.anotherUserRollNo;
    User.findOne({
        rollNo: rollNo
    }).then(user => {
        User.findOne({
                rollNo: anotherUserRollNo
            })
            .then(anotheruser => {
                res.render('main/anotherUserProfile', {
                    pagetitle: 'Profile | ' + anotheruser.name,
                    isLoggedIn: true,
                    rollNo: rollNo,
                    username: user.name,
                    numberOfNewNotifications: user.numberOfNewNotifications,
                    anotheruser: anotheruser
                });
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });
};