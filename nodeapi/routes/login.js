const express = require("express");
const User = require("../schema/User");
const bcryptjs = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const auth = require("../middleware/auth");

router.post("/", (req, res) => {
  const { email, password } = req.body;
  //* Login simple validation
  if (!email || !password) {
    return res.status(400).json({ msg: "Enter all fields" });
  }

  //* Validate if user exists
  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: `User does not exists` });

    //* Validate the password
    bcryptjs.compare(password, user.password).then((isMatch) => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

      jwt.sign(
        { id: user._id },
        config.get("amazonsecret"),
        { expiresIn: 10255600 },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
          });
        }
      );
    });
  });
});

router.get("/user", auth, (req, res) => {
  User.findById(req.amazonUser.id)
    .select("-password")
    .then((user) => res.status(200).json(user));
});


router.post("/forgot_password", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: "Email is Reuired!" });
  }

  User.findOne({ email }).then((user) => {
    if (!user) return res.status(400).json({ msg: `User does not exists` });
    res.status(200).json({
      user: {
        id: user._id,
      },
    });
  });
});


router.post("/reset_password", (req, res) => {
  const { password, user_id } = req.body;
  var newPassword = password; 
  //* Small validation
  if (!password || !user_id) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  //* Check if this user exists in the database
  User.findOne({ _id: user_id }).then((user) => {
    if (!user) return res.status(400).json({ msg: "User Not Exists" });

    //* Create a hashed password *//
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err)
          return res.status(400).json({ msg: "Error hasing a password" });
        newPassword = hash;
        User.update({"_id": user_id}, {'password' : newPassword}, function(err, result) {
          return res.status(200).json(true);
        })
      });
    });
  });
});
module.exports = router;
