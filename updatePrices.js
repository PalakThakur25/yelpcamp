
const mongoose = require('mongoose');
const Campground = require('./models/campground');

const updatePrices = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

    const campgrounds = await Campground.find({});

    for (const campground of campgrounds) {
        const location = campground.location.toLowerCase();

        let minPrice = 1000;
        let maxPrice = 2500;

        if (
            location.includes('pawna') ||
            location.includes('lonavala')
        ) {
            minPrice = 1000;
            maxPrice = 3000;
        } else if (
            location.includes('manali') ||
            location.includes('leh') ||
            location.includes('pangong') ||
            location.includes('tawang')
        ) {
            minPrice = 1500;
            maxPrice = 4000;
        } else if (
            location.includes('coorg') ||
            location.includes('munnar') ||
            location.includes('wayanad')
        ) {
            minPrice = 1200;
            maxPrice = 3500;
        }

        campground.price =
            Math.floor(Math.random() * (maxPrice - minPrice + 1) / 100) * 100
            + minPrice;

        await campground.save();
    }

    console.log(`Updated prices for ${campgrounds.length} campgrounds.`);
};

updatePrices()
    .then(() => mongoose.connection.close())
    .catch(err => {
        console.error(err);
        mongoose.connection.close();
        process.exitCode = 1;
    });
