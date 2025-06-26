if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require('helmet');

const Campground = require("./models/campground");
const Review = require("./models/review");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const dbUrl = process.env.DB_URL;
//use local or production database

// const dbUrl ='mongodb://localhost:27017/campscape';
// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl);

const MongoStore = require('connect-mongo');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');
app.set('query parser', 'extended');

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); //pass in the string that we wanna use for our query string
app.use(express.static(path.join(__dirname, "public")));
app.use(sanitizeV5({ replaceWith: '_' }));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name : 'session',
  secret: "thisshouldbeabettersecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure : true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet())


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", 
];
const connectSrcUrls = [
    "https://api.maptiler.com/", 
];

const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


app.use(passport.initialize());
app.use(passport.session());
// console.dir(User);

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // console.log(req.session);
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get('/fakeUser', async(req, res) => {
  const user = new User({email : 'arya@gmail.com', username : 'arya'});
  const newUser = await User.register(user, 'chicken');
  res.send(newUser);
})

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  // res.send("HELLO FROM CAMP SCAPE!")
  res.render("home");
});

// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title : 'My Backyard', description : 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

//for every single request
app.all(/(.*)/, (req, res, next) => {
  // res.send("404!");
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  // res.status(statusCode).send(message);
  if (!err.message) err.message = "Oh No, Something went wrong";
  res.status(statusCode).render("error", { err });
  // res.send("Oh Boy");
});

// app.use

app.listen(3000, () => {
  console.log("Serving on port 3000");
});

// app.all(/(.*)/, (req, res, next) => {
