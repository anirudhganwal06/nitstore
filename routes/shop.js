const express = require('express');

const router = express.Router();

const shopController = require('../controllers/shop');
const isAuth = require('../middlewares/isAuth');

router.get('/:rollNo', isAuth, shopController.getUserHomePage);

router.get('/:rollNo/sell', isAuth, shopController.getSellProduct);

router.post('/:rollNo/sell', isAuth, shopController.postSellProduct);

router.get('/:rollNo/product/:product_id', isAuth, shopController.getProductDetailPage);

router.delete('/:rollNo/product/:product_id/notify-seller', isAuth, shopController.deleteNotifySeller);

module.exports = router;