const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        minLength: 4,
        maxLength: 50,
        required : true
    },
    lastName: {
        type: String,
        minLength: 4,
        maxLength: 50,
        required : true
    },
    gender: {
        type: String,
        lowercase : true,
        validate(value) {
            const acceptedGenders = ["male", "female", "others"];
            if (!acceptedGenders.includes(value)) {
                throw new Error("Gender is not valid")
            }

        }
    },
    emailId: {
        type: String,
        required: true,
        unique : true,
        trim: true,
        lowercase : true,
        validate(value) {
            if (!validator.isEmail(value)){
                throw new Error("Invalid Email format");
            }
        }
        
    },
    password: {
        type: String,
        required : true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('password atleast have one upperase, special character and numeric value');
            }
        }
    },
    age: {
        type: Number,
        required : true,
        min: 15,
    },
    userName: {
        type: String,
        required: true,
        unique : true,
        match: [/^[a-zA-Z0-9_]+$/, 'userName can only contain letters, numbers, and underscores']
    },
    skills: {
        type : [String]
    },
    about : {
        type : String,
        default : "Hello everyone, welcome to my profile!!"
    },
    photoURL : {
        type : String,
        default : "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid&w=740",
        validate(value){
            if(!validator.isURL(value)){
                throw new Error("Invalid URL syntax")
            }
          }

    }
})



const User = mongoose.model("Users", userSchema);
module.exports = User;