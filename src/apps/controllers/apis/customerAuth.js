const CustomerModel = require("../../models/customer");
const bcrypt = require("bcrypt");
const jwt = require("../../../libs/jwt");
const { validationResult } = require("express-validator");
exports.register = async (req, res) => {
  try {
    // Validate form
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        message: "Validator customer",
        errors: errors.array(),
      });
    }
    const { fullName, email, password, phone, address } = req.body;
    // Validate unique email
    const emailExists = await CustomerModel.findOne({ email });
    if (emailExists)
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    // Validate unique password
    const phoneExists = await CustomerModel.findOne({ phone });
    if (phoneExists)
      return res.status(400).json({
        status: "error",
        message: "Phone already exists",
      });
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = await CustomerModel.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      address,
    });
    return res.status(201).json({
      status: "success",
      message: "Registered customer successfully",
      data: newCustomer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    // Check valid email
    const { email, password } = req.body;
    const isEmail = await CustomerModel.findOne({ email });
    if (!isEmail)
      return res.status(400).json({
        status: "error",
        message: "Invalid email",
      });
    // Check valid password
    const isPassword = await bcrypt.compare(password, isEmail.password);
    if (!isPassword)
      return res.status(400).json({
        status: "error",
        message: "Invalid password",
      });
    // Response acess token & customer
    if (isEmail && isPassword) {
      const accessToken = await jwt.generateAccessToken(isEmail);
      const refreshToken = await jwt.generateRefreshToken(isEmail);
      const { password, ...others } = isEmail.toObject();

      // Response refresh token
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 1 * 24 * 60 * 60,
      });
      return res.status(200).json({
        status: "success",
        message: "Logined successfully",
        customer: others,
        accessToken,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.logout = async (req, res) => {};
exports.resfreshToken = async (req, res) => {
  try {
    const { customer } = req;
    const accessToken = await jwt.generateAccessToken(customer);
    return res.status(200).json({
      status: "success",
      message: "Access token refreshed successfully",
      accessToken,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      status: "success",
      message: "User profile retrieved successfully",
      data: req.customer,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};
