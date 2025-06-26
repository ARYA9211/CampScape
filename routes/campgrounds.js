const express = require("express");
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require("../utils/catchAsync.js");
const { campgroundSchema } = require("../schemas.js");
const Campground = require("../models/campground.js");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");

const multer = require('multer');
const {storage} = require('../cloudinary');//node automatically looks for index.js file
const upload = multer({storage});


router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground,
    catchAsync(campgrounds.createCampground));
    // .post(upload.array('image'), (req, res) => {
    //     res.send("IT WORKED")
    //     console.log(req.body, req.files)
    // })  
router.get("/new", isLoggedIn, campgrounds.renderNewForm);
//order does matter
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground,catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));


//using async request response handler here
//by default empty req body as req body has not been parsed

//edit : route that serves the form

router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

//Faking post as put

//fake out express into beleiving that it is a delete even though it is a post request

module.exports = router;
