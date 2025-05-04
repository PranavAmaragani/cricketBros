const validator = require('validator');

const validateSignupData = (req) => {
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

    if (!firstName || !lastName) {
        throw new Error("Name is invalid");
    }

    if (age < 15) {
        throw new Error("You are too young!");
    }

    if (!validator.isEmail(emailId)) {
        throw new Error("your emailId format is not valid!!")
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error("Enter Strong Password") 
    };

    if (skills.length > 10) {
        throw new Error("skills cannot be morethan 10")
    }
}

const validateUserProfileData = (req) => {
    const updationData = req.body;
    const allowedEditFields = [
        "firstName",
        "lastName",
        "gender",
        "emailId",
        "age",
        "skills",
        "about",
        "photoURL"
    ]

    
    const isEditAllowed = Object.keys(updationData).every((k) => allowedEditFields.includes(k));
    if (!isEditAllowed) {
        throw new Error("Updation data is Invalid");
    }

    if (!isEditAllowed) {
        throw new Error("Updation data contains invalid fields");
    }

    // Individual field validations
    if (updationData.skills && updationData.skills.length > 10) {
        throw new Error("Skills cannot be more than 10");
    }

    if (updationData.emailId && !validator.isEmail(updationData.emailId)) {
        throw new Error("Your email format is not valid");
    }

    if (updationData.about && updationData.about.trim().split(/\s+/).length > 100) {
        throw new Error("About section should not be greater than 100 words");
    }

    if (updationData.age && updationData.age < 15) {
        throw new Error("You are too young!");
    }

    

    return isEditAllowed;

}
module.exports = {
    validateSignupData,
    validateUserProfileData
}