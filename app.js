const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');
const uniqid = require('uniqid');

const mongoURI = 'mongodb+srv://anirudhganwal06:mongodb06@cluster0-mqwgk.mongodb.net/test?retryWrites=true&w=majority';
const CLOUD_NAME = 'nitstore';
const API_KEY = '662278785976996';
const API_SECRET = 'x4rqy2h6dMIw_KAeE_hrBSk-gNI';


const app = express();

const sessionStore = new mongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

// const imageStore = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'images');
//     },
//     filename: (req, file, cb) => {
//         console.log(file);
//         cb(null, uniqid() + '_' + file.originalname);
//     }
// });

cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
});

const imageStore = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: "images",
    allowedFormats: ["jpg", "jpeg", "png"],
    // transformation: [{
    //     width: 500,
    //     height: 500,
    //     crop: "limit"
    // }]
});



app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(multer({
    storage: imageStore
}).single('image'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: 'hahaha',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
app.use(flash());

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shop');

app.use(mainRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use('/', (req, res, next) => {
    res.status(404).render('error/404.ejs', {
        pagetitle: 'Page Not Found!'
    });
});

mongoose.connect(mongoURI, {
        useNewUrlParser: true
    })
    .then(() => {
        app.listen(process.env.PORT || 2000, console.log('Server started...'));
    })
    .catch(err => {
        console.log(err);
    });