const jwt = require("jsonwebtoken");
const User = require("../models/user.js");

const userAuth = async (req, res, next) => {
    try {
        
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Please Login!")
        }
        const decodedObj = jwt.verify(token, "CricketBros@1845");
        
        const { _id } = decodedObj;
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("No User Found!")
        };
        req.user = user;
        next();
    } catch (err) {
        res.status(400).send("Error!"+err.message)
    }
}


module.exports = {userAuth}