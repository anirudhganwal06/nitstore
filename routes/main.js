const express = require('express');

const router = express.Router();

const mainController = require('../controllers/main');
const isNotAuth = require('../middlewares/isNotAuth');

router.get('/', isNotAuth, mainController.getHomePage);

router.get('/product/:product_id', mainController.getProductDetailPage);

module.exports = router;