const Product = require('../models/product');
const User = require('../models/user');

exports.getHomePage = async (req, res, next) => {
    const products = await Product.find();
    try {
        res.render('main/home', {
            pagetitle: 'NIT Store',
            isLoggedIn: false,
            products: products
        });
    } catch (err) {
        const error = new Error('Something went wrong with the Database!');
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProductDetailPage = async (req, res, next) => {
    const product_id = req.params.product_id;
    try {
        const product = await Product.findOne({
            _id: product_id
        });
        const seller = await User.findOne({
            rollNo: product.sellerRollNo
        });
        res.render('shop/productDetail.ejs', {
            pagetitle: 'Product Details',
            isLoggedIn: false,
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