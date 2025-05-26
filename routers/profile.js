const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const { validateUserProfileData} = require("../utils/validate.js");
const bcrypt = require("bcrypt");
const validator = require("validator");



//get profile api
profileRouter.get("/profile",userAuth, async (req, res) => { 
    try {
        const user = req.user;
        if (!user) {
            throw new Error("User Not Found!!")
        } else {
            res.status(200).send(user)
        }
    } catch (error) {
        res.status(400).send("Unauthorized or Invalid Token");
    }
    
})

//edit profile api
profileRouter.patch("/profile/edit",userAuth , async (req, res) => {
    try {
        
        if (!validateUserProfileData(req)) {
            throw new Error("Invalid Edit Request!")
        }
        const loggedInUser = req.user;;
       
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        loggedInUser.save();
        res.status(200).send("Updation Successfull")
        
    }
    catch (err) {
        res.send("Didn't updated" + err.message);
    }
   
})

//change password api
profileRouter.patch("/profile/change/password", userAuth, async (req, res) => {
    try {
        const { previousPassword, newPassword } = req.body;
        const oldPassword = previousPassword;
        const hashedPassword = req.user.password;
        //checking oldpassword correct or not
        const isPasswordValid = await bcrypt.compare(oldPassword, hashedPassword);
        if (!isPasswordValid) {
            throw new Error("Previous Password is Incorrect!")
            }
        //if password valid changing the password
        if (!validator.isStrongPassword(newPassword)) {
            throw new Error("your password is not strong enough ")
        }

        if (previousPassword === newPassword) {
            throw new Error("New Password cannot be same as Previous Password")
        }
        
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            req.user.password = newHashedPassword;
            await req.user.save();
            res.status(200).send("Password Changed Successfully!")
         } catch (err) {
            res.status(400).send("Errorr!!" +  err.message)
        }
        
   
    
})

module.exports = { profileRouter };