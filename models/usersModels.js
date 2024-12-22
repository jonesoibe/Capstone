const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({

    first_name: { 
        type: String, 
        required: true },

     last_name: { 
        type: String, 
        required: true },

    email: {
        type: String,
        required: [true, "Email is required!"],
        trim: true,
        unique: [true, "Email must be unique!"],
        minLength: [5, "Email must have at least 5 characters"],
        lowercase: true,
             },

     password: {
        type: String,
        required: [true, "Password must be provided"],
        trim: true,
        select: false,
     },

    verified: {
        type: Boolean,
        select: false,
        },

    verificationCode: {
        type: String,
        select: false,
    },

    verificationcodeValidation: {
        type: Number,
        select: false,
     },

    forgotPasswordCode: {
        type: String,
        select: false,
     },

    forgotPasswordCodeValidation: {
        type: Number,
        select: false,
     },
}, {
    timestamps:true
});

module.exports = mongoose.model("User", userSchema)