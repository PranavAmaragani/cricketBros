const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const { validateUserProfileData } = require("../utils/validate.js");
const bcrypt = require("bcrypt");
const validator = require("validator");

//get profile api
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User Not Found!!");
    } else {
      res.status(200).send(user);
    }
  } catch (error) {
    res.status(400).send("Unauthorized or Invalid Token " + err.message);
  }
});

//edit profile api
profileRouter.put("/profile/edit", userAuth, async (req, res) => {
  
  try {
    if (!validateUserProfileData(req)) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
   
    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR : " + err.message);
  }
});

//change password api
profileRouter.patch("/profile/change/password", userAuth, async (req, res) => {
  try {
    const { previousPassword, newPassword } = req.body;
    const oldPassword = previousPassword;
    const hashedPassword = req.user.password;
    //checking oldpassword correct or not
    const isPasswordValid = await bcrypt.compare(oldPassword, hashedPassword);
    if (!isPasswordValid) {
      throw new Error("Previous Password is Incorrect!");
    }
    //if password valid changing the password
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("your password is not strong enough ");
    }

    if (previousPassword === newPassword) {
      throw new Error("New Password cannot be same as Previous Password");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    const loggedInUser = req.user;
    loggedInUser.password = newHashedPassword;
    await loggedInUser.save();
    res.json({
      message: "Your Password Updated Successfully!!",
      
    });
  } catch (err) {
    res.status(400).json({ error: "Profile not updated: " + err.message });
  }
});

module.exports = { profileRouter };
