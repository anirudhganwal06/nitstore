const express = require('express');

const router = express.Router();

const mainController = require('../controllers/main');
const isNotAuth = require('../middlewares/isNotAuth');

router.get('/', isNotAuth, mainController.getHomepage);

module.exports = router;