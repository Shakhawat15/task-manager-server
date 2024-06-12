const express = require("express");
const router = express.Router();

// import controller
const {
  register,
  login,
  updateProfile,
} = require("../controllers/user.controller");
const { auth } = require("../middlewares/auth.middleware");

// routes
router.post("/register", register);
router.post("/login", login);
router.put("/update-profile", auth, updateProfile);

module.exports = router;
