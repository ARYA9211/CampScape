const express = require('express');
const router = express.Router({mergeParams : true});

const  {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')

const Campground = require('../models/campground.js');
const Review = require('../models/review.js')
const reviews = require('../controllers/reviews')


const {campgroundSchema, reviewSchema} = require('../schemas.js')


const catchAsync = require("../utils/catchAsync.js")
const ExpressError = require('../utils/ExpressError.js');


router.post('/', validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;