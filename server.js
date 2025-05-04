const express = require('express');
const connectDB = require('./config/database.js');
const app = express();
const cookieParser = require('cookie-parser');
const { authRouter } = require("./routers/auth.js");
const { profileRouter } = require("./routers/profile.js");

app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", profileRouter);

app.get("/", (req, res) => {
    res.send("hello")
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
