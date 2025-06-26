const User = require("../models/user");

module.exports.renderRegister =  (req, res) => {
  res.render("users/register");
}

module.exports.register = async (req, res, next) => {
    // console.log(1);
    try {
      const { email, username, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      // console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Yelp Camp!");
        res.redirect("/campgrounds");
      });

      // console.log(req.body);
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("register");
    }
  }

module.exports.renderLogin =  (req, res) => {
  res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "welcome back!");
    // console.log("path is", req.session.returnTo);
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    delete req.session.returTo;
    res.redirect(redirectUrl);
  }

module.exports.logout =  (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
}