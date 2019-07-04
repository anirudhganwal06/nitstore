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

exports.getUserHomePage = async (req, res, next) => {
    let rollNo = req.params.rollNo;
    try {

        const user = await User.findOne({
            rollNo: rollNo
        });
        const products = await Product.find({
            sellerRollNo: {
                $not: {
                    $regex: rollNo
                }
            }
        });
        res.render('main/home', {
            pagetitle: 'NIT Store',
            isLoggedIn: true,
            rollNo: rollNo,
            username: user.name,
            numberOfNewNotifications: user.numberOfNewNotifications,
            products: products,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getSellProduct = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
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
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postSellProduct = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const shortdesc = req.body.shortdesc;
    const price = req.body.price;
    const imageURL = req.file.url;
    const imagePublicId = req.file.public_id;
    const mobile = req.body.mobile;
    const email = req.body.email;
    const description = req.body.description;
    const createdOn = new Date();
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
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
        await product.save();
        res.redirect('/' + rollNo + '/products-for-sale');
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }

};

exports.getNotifications = (req, res, next) => {
    const rollNo = req.params.rollNo;
    User.findOneAndUpdate({
        rollNo: rollNo
    }, {
        numberOfNewNotifications: 0
    }, {
        new: false
    }, (err, user) => {
        if (err) {
            const error = new Error('Something went wrong with the Database!');
            error.httpStatusCode = 500;
            return next(error);
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

exports.getProductDetailPage = async (req, res, next) => {
    const product_id = req.params.product_id;
    const rollNo = req.params.rollNo;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
        const product = await Product.findOne({
            _id: product_id
        });
        const seller = await User.findOne({
            rollNo: product.sellerRollNo
        });
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
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.deleteNotifySeller = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
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
            const product = await Product.findOne({
                _id: product_id
            });
            await User.updateOne({
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
            });
            await User.updateOne({
                rollNo: rollNo
            }, {
                $push: {
                    productsOfInterest: product_id
                }
            });
            res.json({
                message: 'Seller is notified about your interest!'
            });
            transporter.sendMail({
                to: product.email,
                from: 'nistore@nitkkr.com',
                subject: 'User Interested In Your Product!',
                html: `<h1>Somebody Checked your Product on Sale</h1><br><p><a href='nitstore.herokuapp.com/${product.sellerRollNo}/user/${rollNo}'>${user.name}</a> is interested in buying your product and wants to reach you!</p>`
            });
        }
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getAnotherUserProfile = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const anotherUserRollNo = req.params.anotherUserRollNo;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
        const anotheruser = await User.findOne({
            rollNo: anotherUserRollNo
        });
        const products = await Product.find({
            sellerRollNo: rollNo
        });
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
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProductsForSale = async (req, res, next) => {
    let rollNo = req.params.rollNo;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
        const products = await Product.find({
            sellerRollNo: rollNo
        });
        res.render('shop/productsForSale', {
            pagetitle: 'NIT Store',
            isLoggedIn: true,
            rollNo: rollNo,
            username: user.name,
            numberOfNewNotifications: user.numberOfNewNotifications,
            products: products,
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getEditProduct = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    try {
        const user = await User.findOne({
            rollNo: rollNo
        });
        const product = await Product.findOne({
            _id: product_id
        });
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
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.postEditProduct = async (req, res, next) => {
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
        try {
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
            }, async (err, product) => {
                if (err) {
                    console.log(err);
                } else {
                    await cloudinary.uploader.destroy(product.imagePublicId)
                    res.redirect('/' + rollNo + '/product/' + product_id);
                }
            });
        } catch (err) {
            const error = new Error('Something went wrong with the Database!');
            error.httpStatusCode = 500;
            return next(error);
        }
    } else {
        try {
            await Product.updateOne({
                _id: product_id
            }, {
                shortdesc: shortdesc,
                price: price,
                mobile: mobile,
                email: email,
                description: description
            })
            res.redirect('/' + rollNo + '/product/' + product_id);
        } catch (err) {
            const error = new Error('Something went wrong with the Database!');
            error.httpStatusCode = 500;
            return next(error);
        }
    }

};

exports.getDeleteProduct = async (req, res, next) => {
    const rollNo = req.params.rollNo;
    const product_id = req.params.product_id;
    const imagePublicId = req.params.imagePublicId;
    try {
        await Product.findByIdAndDelete(product_id)
        await cloudinary.uploader.destroy('images/' + imagePublicId)
        res.redirect('/' + rollNo + '/products-for-sale');
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.deleteDeleteProduct = async (req, res, next) => {
    const product_id = req.params.product_id;
    const imagePublicId = req.params.imagePublicId;
    try {
        await Product.findByIdAndDelete(product_id);
        await cloudinary.uploader.destroy('images/' + imagePublicId);
        res.json({
            message: 'Product Deleted Successfully!'
        });
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};