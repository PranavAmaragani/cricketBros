const mongoose = require('mongoose');

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://Pranav503:Sriram%40123@super30.1gyw831.mongodb.net/cricketBros?retryWrites=true&w=majority")
}

module.exports = connectDB;