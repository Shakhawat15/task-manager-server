const userModel = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/password");
const apiResponse = require("../utils/apiResponse");
const jwt = require("jsonwebtoken");

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
    const { firstName, lastName, mobile, photo } = req.body;
    const user = await userModel.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, mobile, photo },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
