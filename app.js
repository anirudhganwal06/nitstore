const express = require('express');
const path = require('path');

const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: false }));

const mainRoutes = require('./routes/main');
const authRoutes = require('./routes/auth');

app.use(mainRoutes);
app.use(authRoutes);

mongoose.connect('mongodb+srv://anirudhganwal06:mongodb06@cluster0-mqwgk.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser: true
    })
    .then(() => {
        app.listen(process.env.PORT || 3000, console.log('Server started...'));
    })
    .catch(err => {
        console.log(err);
    });
