
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const User = require('./models/user');

const assignOwners = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

    const username = process.argv[2];

    if (!username) {
        console.log('Usage: node assignOwners.js YOUR_USERNAME');
        return;
    }

    const user = await User.findOne({ username });

    if (!user) {
        console.log('User not found. Check your username.');
        return;
    }

    const result = await Campground.updateMany(
        { $or: [{ owner: { $exists: false } }, { owner: null }] },
        { $set: { owner: user._id } }
    );

    console.log(`Assigned ownership to ${result.modifiedCount} campgrounds.`);
};

assignOwners()
    .catch(console.error)
    .finally(() => mongoose.connection.close());
