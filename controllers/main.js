const Product = require('../models/product');
const User = require('../models/user');

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
    const product_id = req.params.product_id;
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
                        isLoggedIn: false,
                        product: product,
                        seller: seller
                    });
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        });
};