
const mongoose = require('mongoose');
const Campground = require('./models/campground');

const {
    descriptors,
    places,
    locations,
    descriptions
} = require('./seedHelpers');

const sample = (array) =>
    array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp');

    // WARNING: This replaces all existing campground records.
    await Campground.deleteMany({});

    const campgrounds = places.map((place, index) => {
        const location = locations[index];
        const descriptor = descriptors[index % descriptors.length];

        return {
            title: `${descriptor} ${place}`,
            location: `${location.city}, ${location.state}`,
            price: Math.floor(Math.random() * 76) + 25,
            description: sample(descriptions),
            image: ''
        };
    });

    await Campground.insertMany(campgrounds);

    console.log(`Added ${campgrounds.length} campgrounds.`);
};

seedDB()
    .then(() => mongoose.connection.close())
    .catch((err) => {
        console.error(err);
        mongoose.connection.close();
        process.exitCode = 1;
    });
