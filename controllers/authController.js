const { signupSchema, signinSchema } = require("../middlewares/validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/usersModels");
const { doHashvalidation } = require("../utils/hashing");

const doHash = async (password, saltRounds) => {
  return await bcrypt.hash(password, saltRounds);
};

exports.signup = async (req, res) => {
    try {
      const { email, password, first_name, last_name } = req.body;
  
      // Validate input
      const { error } = signupSchema.validate({ email, password, first_name, last_name });
      if (error) {
        return res.status(401).json({
          success: false,
          message: error.details[0].message,
        });
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(401).json({
          success: false,
          message: "User already exists!",
        });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 12);
  
      // Create and save the new user
      const newUser = new User({
        email,
        password: hashedPassword,
        first_name,
        last_name,
      });
  
      // Save to database
      const result = await newUser.save();
  
      // Remove password from the response
      result.password = undefined;
  
      // Send success response
      res.status(201).json({
        success: true,
        message: "Your account has been created successfully!",
        result,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "An error occurred during the signup process.",
        error: error.message,
      });
    }
  };
  

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const { error } = signinSchema.validate({ email, password });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if the user exists
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "User not found!",
      });
    }

    // Validate the password
    const isPasswordValid = await doHashvalidation(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect credentials!",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: existingUser._id,
        email: existingUser.email,
        verified: existingUser.verified,
      },
      process.env.TOKEN_SECRET,
      { expiresIn: "8h" }
    );

    // Set cookie and send response
    res
      .cookie("Authorization", "Bearer " + token, {
        expires: new Date(Date.now() + 1 * 3600000),
        httpOnly: process.env.NODE_ENV === "production",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({
        success: true,
        token,
        message: "Login successful!",
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An error occurred during the process",
      error: error.message,
    });
  }
};

exports.signout = async (req, res) => {
  res
    .clearCookie("Authorization")
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

exports.sendVerificationCode = async (req, res) => {
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User does not exist!" });
    }
    if (existingUser) {
      return res
        .status(400)
        .json({ success: true, message: "User already verified" });
    }

  } catch (error) {
    console.log(error);
  }
};
