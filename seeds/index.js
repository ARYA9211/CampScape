// //will be running this file own its own separately from our node app
// //anytime we want to seed our database

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
//use local or production database
mongoose.connect("mongodb://localhost:27017/campscape");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// this will work without {}
// const sample = array => array[Math.floor(Math.random() * array.length)];

// console.log(descriptors)
// console.log(sample(descriptors));

const seedDB = async () => {
  await Campground.deleteMany({});
  // const c = new Campground({title : 'purple field'});
  // await c.save();
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //YOUR USER ID
      author: "68590f041e6263925b4cfd42",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dxv5cvuod/image/upload/v1750759812/CampSacpe/uibcrbafu6scfiess4ij.avif",
          filename: "CampSacpe/uibcrbafu6scfiess4ij",
        },
        {
          url: "https://res.cloudinary.com/dxv5cvuod/image/upload/v1750759814/CampSacpe/ynav1c4dhsdvlcg2p7n3.jpg",
          filename: "CampSacpe/ynav1c4dhsdvlcg2p7n3",
        },
      ],
      description:
        "    Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa nisi, adipisci corrupti fuga maxime iste minus expedita exercitationem ab praesentium quasi facilis ducimus corporis ad eaque? Obcaecati sit ducimus optio!",
      price,
      geometry : 
      {
        type : "Point",
        coordinates : 
        [
          cities[random1000].longitude, 
          cities[random1000].latitude, 
        ]
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  db.close();
});
