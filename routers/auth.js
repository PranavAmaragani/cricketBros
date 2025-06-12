const express = require("express");
const authRouter = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const { validateSignupData } = require("../utils/validate.js");

//signup api.

//app.post('/signup', async (req, res) => {

authRouter.post("/signup", async (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    emailId,
    password,
    age,
    userName,
    skills,
    about,
    photoURL,
    location //added
  } = req.body;
  try {
    const existingEmail = await User.findOne({
      emailId: req.emailId,
    });
    if (existingEmail) {
      throw new Error(`EmailId already exists`);
    }

    const existingUserName = await User.findOne({
      userName: req.userName,
    });
    if (existingUserName) {
      throw new Error(`EmailId already exists`);
    }
    //validate userSignupData
    validateSignupData(req);

    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    

    //saving the user data into mongoose collection
    const user = new User({
      firstName,
      lastName,
      gender,
      emailId,
      password: hashedPassword,
      age,
      userName,
      skills,
      about,
      photoURL,
      location//added
    });
    await user.validate();
    await user.save();

    res.status(200).send("Signup success");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//login api
authRouter.post("/login", async (req, res) => {
  try {
   
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credentials!");
    }
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid Credentials")
    } else {
      const token = await user.getJWT();
      res.cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send("Error!"+error.message);
  }
});

//logout api
authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("logged out Successfully!");
});

module.exports = { authRouter };
