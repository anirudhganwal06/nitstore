const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const mongoDBStore = require('connect-mongodb-session')(session);

const mongoURI = 'mongodb+srv://anirudhganwal06:mongodb06@cluster0-mqwgk.mongodb.net/test?retryWrites=true&w=majority';

const app = express();

const sessionStore = new mongoDBStore({
    uri: mongoURI,
    collection: 'sessions'
});

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'hahaha',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));

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
        app.listen(process.env.PORT || 5000, console.log('Server started...'));
    })
    .catch(err => {
        console.log(err);
    });
