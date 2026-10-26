
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const methodOverride = require('method-override');
const engine = require('ejs-mate');

const Campground = require('./models/campground');
const User = require('./models/user');
const { isLoggedIn, isOwner } = require('./middleware');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'yelpcamp-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Shared template variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Async error handler
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// Home page
app.get('/', asyncHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('home', { campgrounds });
}));

// All campgrounds
app.get('/campgrounds', asyncHandler(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// New campground form
app.get('/campgrounds/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// Create campground
app.post('/campgrounds', isLoggedIn, asyncHandler(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.owner = req.user._id;

    await campground.save();

    req.flash('success', 'Successfully created a campground!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Edit campground form
app.get(
    '/campgrounds/:id/edit',
    isLoggedIn,
    isOwner,
    (req, res) => {
        res.render('campgrounds/edit', {
            campground: req.campground
        });
    }
);

// Update campground
app.put(
    '/campgrounds/:id',
    isLoggedIn,
    isOwner,
    asyncHandler(async (req, res) => {
        const campground = await Campground.findByIdAndUpdate(
            req.params.id,
            req.body.campground,
            { new: true, runValidators: true }
        );

        req.flash('success', 'Campground updated successfully!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Delete campground
app.delete(
    '/campgrounds/:id',
    isLoggedIn,
    isOwner,
    asyncHandler(async (req, res) => {
        await Campground.findByIdAndDelete(req.params.id);

        req.flash('success', 'Campground deleted successfully!');
        res.redirect('/campgrounds');
    })
);

// Show one campground
app.get('/campgrounds/:id', asyncHandler(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash('error', 'Campground not found.');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/show', { campground });
}));

// Registration page
app.get('/register', (req, res) => {
    res.render('users/register');
});

// Register user
app.post('/register', asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;

    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);

    req.login(registeredUser, (err) => {
        if (err) return next(err);

        req.flash('success', 'Welcome to YelpCamp!');
        res.redirect('/campgrounds');
    });
}));

// Login page
app.get('/login', (req, res) => {
    res.render('users/login');
});

// Login submission
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            req.flash(
                'error',
                info?.message || 'Invalid username or password.'
            );
            return res.redirect('/login');
        }

        req.login(user, (loginErr) => {
            if (loginErr) return next(loginErr);

            req.flash('success', 'Welcome back to YelpCamp!');
            res.redirect('/campgrounds');
        });
    })(req, res, next);
});

// Logout
app.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);

        req.flash('success', 'You have logged out.');
        res.redirect('/login');
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).send(`Page not found: ${req.method} ${req.originalUrl}`);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);

    if (res.headersSent) return next(err);

    res.status(500).send(
        'Something went wrong. Check the terminal for the error.'
    );
});

// Connect to MongoDB and start server
mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('MongoDB connected successfully!');

        app.listen(3000, () => {
            console.log('Serving on port 3000');
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });
