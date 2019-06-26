const Product = require('../models/product');

exports.getHomePage = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('main/home', {
                pagetitle: 'NIT Store',
                isLoggedIn: false,
                products: products
            });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getProductDetailPage = (req, res) => {
    console.log('product details');
};
