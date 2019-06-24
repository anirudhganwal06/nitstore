module.exports = (req, res, next) => {
    if (req.session.isLoggedIn === true && req.session.rollNo === req.params.rollNo) {
        next();
    } else {
        res.redirect('/login');
    }
};