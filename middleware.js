
const Campground = require('./models/campground');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in first!');
        return res.redirect('/login');
    }

    next();
};

module.exports.isOwner = async (req, res, next) => {
    try {
        const campground = await Campground.findById(req.params.id);

        if (!campground) {
            req.flash('error', 'Campground not found.');
            return res.redirect('/campgrounds');
        }

        if (
            !campground.owner ||
            !campground.owner.equals(req.user._id)
        ) {
            req.flash('error', 'You are not allowed to do that.');
            return res.redirect(`/campgrounds/${campground._id}`);
        }

        req.campground = campground;
        next();
    } catch (err) {
        next(err);
    }
};
