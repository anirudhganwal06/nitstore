const cloudinary = require('cloudinary');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');
const Product = require('../models/product');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key: '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'
    } 
}));

exports.getUserHomePage = (req, res, next) => {
    let rollNo = req.params.rollNo;
    User.findOne({
        rollNo: rollNo
    }).then(user => {
        Product.find({
                sellerRollNo: {
                    $not: {
                        $regex: rollNo
                    }
                }
            })
            .then(products => {
                res.render('main/home', {
                    pagetitle: 'NIT Store',
                    isLoggedIn: true,
                    rollNo: rollNo,
                    username: user.name,
                    numberOfNewNotifications: user.numberOfNewNotifications,
                    products: products,
                    csrfToken: req.csrfToken()
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
                isEditing: false,
                csrfToken: req.csrfToken()
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
                res.redirect('/' + rollNo + '/products-for-sale');
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
                csrfToken: req.csrfToken()
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
                            seller: seller,
                            csrfToken: req.csrfToken()
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
                        message: "Seller is already notified about your interest!"
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
                            .then(result => {
                                User.updateOne({
                                        rollNo: rollNo
                                    }, {
                                        $push: {
                                            productsOfInterest: product_id
                                        }
                                    }).then(result => {
                                        res.json({
                                            message: 'Seller is notified about your interest!'
                                        });
                                        return transporter.sendMail({
                                            to: product.email,
                                            from: 'nistore@nitkkr.com',
                                            subject: 'User Interested In Your Product!',
                                            html: `<h1>Somebody Checked your Product on Sale</h1><br><p><a href='nitstore.herokuapp.com/${product.sellerRollNo}/user/${rollNo}'>${user.name}</a> is interested in buying your product and wants to reach you!</p>`
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
                Product.find({
                    sellerRollNo: rollNo
                })
                    .then(products => {
                        res.render('main/anotherUserProfile', {
                            pagetitle: 'Profile | ' + anotheruser.name,
                            isLoggedIn: true,
                            rollNo: rollNo,
                            username: user.name,
                            numberOfNewNotifications: user.numberOfNewNotifications,
                            anotheruser: anotheruser,
                            products: products,
                            csrfToken: req.csrfToken()
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

exports.getProductsForSale = (req, res, next) => {
    let rollNo = req.params.rollNo;
    User.findOne({
        rollNo: rollNo
    }).then(user => {
        Product.find({
                sellerRollNo: rollNo
            })
            .then(products => {
                res.render('shop/productsForSale', {
                    pagetitle: 'NIT Store',
                    isLoggedIn: true,
                    rollNo: rollNo,
                    username: user.name,
                    numberOfNewNotifications: user.numberOfNewNotifications,
                    products: products,
                    csrfToken: req.csrfToken()
                });
            })
            .catch(err => {
                console.log(err);
            });
    }).catch(err => {
        console.log(err);
    });
};

exports.getEditProduct = (req, res) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    User.findOne({
            rollNo: rollNo
        })
        .then(user => {
            Product.findOne({
                    _id: product_id
                })
                .then(product => {
                    res.render('shop/sellProduct', {
                        pagetitle: 'Sell Product',
                        isLoggedIn: true,
                        rollNo: req.params.rollNo,
                        username: user.name,
                        numberOfNewNotifications: user.numberOfNewNotifications,
                        mobile: user.mobile,
                        email: user.email,
                        isEditing: true,
                        product: product,
                        csrfToken: req.csrfToken()
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

exports.postEditProduct = (req, res) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    const shortdesc = req.body.shortdesc;
    const price = req.body.price;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const description = req.body.description;
    if (req.file) {
        const imageURL = req.file.url;
        const imagePublicId = req.file.public_id;
        Product.findOneAndUpdate({
            _id: product_id
        }, {
            shortdesc: shortdesc,
            price: price,
            mobile: mobile,
            email: email,
            description: description,
            imageURL: imageURL,
            imagePublicId: imagePublicId
        }, {
            new: false
        }, (err, product) => {
            if (err) {
                console.log(err);
            } else {
                cloudinary.uploader.destroy(product.imagePublicId)
                    .then(cloudinaryResult => {
                        res.redirect('/' + rollNo + '/product/' + product_id);
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        });
    } else {
        Product.updateOne({
                _id: product_id
            }, {
                shortdesc: shortdesc,
                price: price,
                mobile: mobile,
                email: email,
                description: description
            })
            .then(result => {
                res.redirect('/' + rollNo + '/product/' + product_id);
            })
            .catch(err => {
                console.log(err);
            });
    }

};

exports.getDeleteProduct = (req, res) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    const imagePublicId = req.params.imagePublicId;
    Product.findByIdAndDelete(product_id)
        .then(result => {
            cloudinary.uploader.destroy('images/' + imagePublicId)
                .then(cloudinaryResult => {
                    res.redirect('/' + rollNo + '/products-for-sale');
                })
                .catch(err => {
                    console.log(err);
                });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.deleteDeleteProduct = (req, res) => {
    const product_id = req.params.product_id;
    const imagePublicId = req.params.imagePublicId;
    Product.findByIdAndDelete(product_id)
        .then(result => {
            cloudinary.uploader.destroy('images/' + imagePublicId)
                .then(cloudinaryResult => {
                    res.json({
                        message: 'Product Deleted Successfully!'
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