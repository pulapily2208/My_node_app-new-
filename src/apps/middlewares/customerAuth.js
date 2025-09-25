const CustomerModel = require("../models/customer");
const jwt = require("jsonwebtoken");
const config = require("config");
exports.verifyAccessToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({
        status: "error",
        message: "Token is required",
      });
    jwt.verify(token, config.get("app.jwtAccessKey"), async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          return res.status(401).json({
            status: "error",
            message: "Token Expired",
          });

        return res.status(401).json({
          status: "error",
          message: "Invalid token",
        });
      }
      const customer = await CustomerModel.findById(decoded.id).select(
        "-password"
      );
      req.customer = customer;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token)
      return res.status(401).json({
        status: "error",
        message: "Token is required",
      });
    jwt.verify(token, config.get("app.jwtRefreshKey"), async (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError")
          return res.status(401).json({
            status: "error",
            message: "Token expired",
          });
        return res.status(401).json({
          status: "error",
          message: "Invalid token",
        });
      }
      req.customer = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
