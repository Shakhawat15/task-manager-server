const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/apiResponse");

exports.auth = (req, res, next) => {
  try {
    const decoded = jwt.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );

    req.user = decoded;
    next();
  } catch (err) {
    return apiResponse.unauthorizedResponse(res, "Unauthorized");
  }
};
