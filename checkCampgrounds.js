
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const User = require('./models/user');

const checkData = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

    const users = await User.find({}, 'username');
    const campgrounds = await Campground.find(
        {},
        'title owner location'
    );

    console.log('\nRegistered users:');
    console.log(users);

    console.log('\nTotal campgrounds:', campgrounds.length);

    console.log('\nCampground ownership:');
    campgrounds.forEach(campground => {
        console.log({
            title: campground.title,
            location: campground.location,
            owner: campground.owner || 'NO OWNER'
        });
    });
};

checkData()
    .catch(console.error)
    .finally(() => mongoose.connection.close());
