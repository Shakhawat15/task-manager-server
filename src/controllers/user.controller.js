const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const { hashPassword, comparePassword } = require("../utils/password");
const apiResponse = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Registration of a new user
exports.register = async (req, res) => {
  try {
    const { email, firstName, lastName, mobile, password, photo } = req.body;
    // check if user exists
    const userExists = await userModel.findOne({ email });

    if (userExists) {
      return apiResponse.ErrorResponse(res, "Email already exists");
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    const user = new userModel({
      email,
      firstName,
      lastName,
      mobile,
      password: hashedPassword,
      photo,
    });

    await user.save();

    // send response
    if (user) {
      return apiResponse.successResponse(res, "Registration Successful!");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, err.message);
  }
};

// Login of a user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    const user = await userModel.findOne({ email });
    console.log(user);
    if (!user) {
      return apiResponse.ErrorResponse(res, "User not found");
    }
    // compare password
    const match = await comparePassword(password, user.password);

    if (!match) {
      return apiResponse.ErrorResponse(res, "Invalid email or password");
    }
    // create signed jwt
    const token = jwt.sign(
      { _id: user._id, email: email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const data = {
      email: user["email"],
      firstName: user["firstName"],
      lastName: user["lastName"],
      mobile: user["mobile"],
      photo: user["photo"],
    };

    // send response
    return apiResponse.successResponseWithDataNToken(
      res,
      "LogIn Successful!",
      data,
      token
    );
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobile, photo, password } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, mobile, photo, password },
      { new: true }
    );

    return apiResponse.successResponseWithData(res, "Profile updated", user);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const email = req.user.email;
    console.log("email", email);
    const user = await userModel.findOne({ email });
    return apiResponse.successResponseWithData(res, "User", user);
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await userModel.findOne({ email });

    if (!user) {
      return apiResponse.ErrorResponse(res, "User not found");
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // if the email is already in the otp collection, update it
    const existingOTP = await otpModel.findOne({ email });
    if (existingOTP) {
      existingOTP.otp = otp;
      existingOTP.status = 0;
      await existingOTP.save();
      // send email
      const subject = "Task Manager PIN Verification";
      const text = `Your OTP code is ${otp}`;
      await sendEmail(email, subject, text);
      return apiResponse.successResponse(res, "OTP sent to your email");
    } else {
      // save otp
      const newOTP = new otpModel({ email, otp });
      await newOTP.save();
      // send email
      const subject = "Task Manager PIN Verification";
      const text = `Your OTP code is ${otp}`;
      await sendEmail(email, subject, text);
      return apiResponse.successResponse(res, "OTP sent to your email");
    }
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.params;
    const userOTP = await otpModel.findOne({ email, otp });

    if (!userOTP) {
      return apiResponse.ErrorResponse(res, "Invalid OTP");
    } else if (userOTP.status === 1) {
      return apiResponse.ErrorResponse(res, "OTP already Used");
    }

    // update otp status
    userOTP.status = 1;
    await userOTP.save();

    return apiResponse.successResponse(res, "OTP verified successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};

// Create New Password
exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { email, otp } = req.params;
    const user = await userModel.findOne({ email });
    if (!user) {
      return apiResponse.ErrorResponse(res, "User not found");
    }

    // check if otp is verified
    const userOTP = await otpModel.findOne({ email, otp });
    if (!userOTP) {
      return apiResponse.ErrorResponse(res, "Invalid OTP");
    } else if (userOTP.status === 0) {
      return apiResponse.ErrorResponse(res, "OTP not verified");
    }

    // hash password
    const hashedPassword = await hashPassword(password);

    // update password
    user.password = hashedPassword;
    await user.save();

    return apiResponse.successResponse(res, "Password updated successfully");
  } catch (error) {
    return apiResponse.ErrorResponse(res, error.message);
  }
};
