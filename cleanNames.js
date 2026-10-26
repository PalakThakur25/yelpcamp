
const mongoose = require('mongoose');
const Campground = require('./models/campground');

const cleanNames = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

    const campgrounds = await Campground.find({});

    let updatedCount = 0;

    for (const campground of campgrounds) {
        const words = campground.title.trim().split(/\s+/);

        // Remove a repeated adjective at the beginning.
        if (
            words.length >= 3 &&
            words[0].toLowerCase() === words[1].toLowerCase()
        ) {
            campground.title = words.slice(1).join(' ');
            await campground.save();
            updatedCount++;
        }
    }

    console.log(`Checked ${campgrounds.length} campgrounds.`);
    console.log(`Cleaned ${updatedCount} duplicate names.`);
};

cleanNames()
    .catch(err => {
        console.error('Error cleaning names:', err);
    })
    .finally(async () => {
        await mongoose.connection.close();
    });
