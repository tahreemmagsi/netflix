const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/users");

router.post("/register", async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const newUser = new User({ username, isAdmin: isAdmin === true });

    const registeredUser = await User.register(newUser, password);

    passport.authenticate("local")(req, res, () => {
      res.json({ success: true, user: registeredUser });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({
        success: true,
        message: "Logged in successfully",
        user,
      });
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.json({ success: true, message: "Logged out successfully" });
  });
});
router.get("/check-auth", (req, res) => {
  console.log("User auth", req.isAuthenticated);
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false, user: null });
  }
});

router.get("/admin/register", (req, res) => {
  res.render("adminRegister");
});

router.post("/admin/register", async (req, res) => {
  try {
    const secretCode = req.body.secretCode;
    if (secretCode !== "abcd1234") {
      return res.render("adminRegister", {
        errorMessage: "Invalid secret code",
      });
    }
    const isAdmin = true;
    const user = await User.register(
      new User({ username: req.body.username, isAdmin }),
      req.body.password
    );
    passport.authenticate("local")(req, res, () => {
      res.json({ success: true, user });
      // res.redirect('/admin/login');
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get("/admin/login", (req, res) => {
  res.render("adminLogin");
});
router.post("/admin/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("adminLogin", {
        errorMessage: "Invalid username or password",
      });
    }
    if (!user.isAdmin) {
      return res.render("adminLogin", {
        errorMessage: "You are not authorized as admin",
      });
    }
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        res.status(500).json({ success: false, error: loginErr.message });
      }
      console.log("login successful");
      res.redirect("/");
    });
  })(req, res, next);
});

router.get("/admin/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ success: false, error: loginErr.message });
    }
    res.redirect("/admin/login");
  });
});

module.exports = router;
