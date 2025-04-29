const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require("./models/user.js");
const validateSignupData = require("./utils/validate.js");
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hello")
})

//signup api
app.post('/signup', async (req, res) => {
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
        photoURL
    } = req.body;
    try {
        //validate userSignupData
        validateSignupData(req)

        //hashing the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // console.log(hashedPassword)

        //saving the user data into monoose collection
        const user = new User({
            firstName,
            lastName,
            gender,
            emailId,
            password : hashedPassword,
            age,
            userName,
            skills,
            about,
            photoURL
        }
        )
        await user.save();
        res.status(200).send("Signup success")
        
    } catch (err) {
        res.status(400).send('ERROR: ' + err.message);
    }
    
})

//login api
app.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid Credentials!");
        }
        const isPasswordValid = bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials");
        }
        res.status(200).send("Login Successfull")
    } catch (error) {
        res.status(400).send("Login UnSuccessfull");  
    }
})


//connecting to Database
connectDB().then(() => {
    console.log("Database Connected Successfully");
    app.listen(3000, () => {
        console.log("App is listening on 3000 port!")
    })

}).catch((err) => {
    console.log("ERROR" +err.message)
})
