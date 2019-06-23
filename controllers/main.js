exports.getHomepage = (req, res) => {
    res.render('main/home', {
        pagetitle: 'NIT Store'
    });
}