// importing default packages
const path = require('path');

// importing third party packages
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const dotenv = require('dotenv');
const uniqid = require('uniqid');

// configuring dotenv for environment variables
dotenv.config();

// importing secrets and keys from environment variables
const mongoURI = process.env.mongoURI;
const CLOUD_NAME = 'nitstore';
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

// using express as a function
const app = express();

// creating a session store
const sessionStore = new mongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

// using csrf as a function
const csrfProtection = csrf();

// configuring cloudinary for uploading images
cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

// creating the image store with the help of configured cloudinary
const imageStore = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "images",
    allowedFormats: ["jpg", "jpeg", "png"],
    transformation: [{
        width: 500,
        height: 500,
        crop: "limit"
    }]
});

// setting view path and view engine
app.set('views', 'views');
app.set('view engine', 'ejs');

// setting the path of static files
app.use(express.static(path.join(__dirname, 'static')));

// storing the multipart data i.e, product images in the image store
app.use(multer({
    storage: imageStore
}).single('image'));

// for parsing the form data and inserting that into req.body
app.use(bodyParser.urlencoded({
    extended: false
}));

// configuring session and using it for storing the authentication info
app.use(session({
    secret: 'hahaha',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

// using csrf protection for preventing cross site request forgery
app.use(csrfProtection);

// using flash for storing a flash of data between request like validation errors
app.use(flash());

// importing the routes
const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

// using all the routes
app.use(mainRoutes);
app.use(authRoutes);
app.use(shopRoutes);

// 404 error handling
app.use(errorController.get404);

// error handling middleware
app.use((error, req, res, next) => {
    if (error.httpStatusCode === 500) {
        res.status(500).render('error/500', {
            pagetitle: 'Internal Server Error',
            errorMessage: error.message
        });
    } else {
        next();
    }
});

// connect to mongodb database with mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true
})
    .then(() => {
        app.listen(process.env.PORT || 5000, console.log('Server started...'));
    })
    .catch(err => {
        console.log(err);
    });