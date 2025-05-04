const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middleware/auth.js");
const {validateUserProfileData} = require("../utils/validate.js")



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

module.exports = { profileRouter };