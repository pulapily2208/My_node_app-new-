const express = require("express");
const router = express.Router();

// Import Controller
const CategoryController = require("../apps/controllers/apis/category");
const ProductController = require("../apps/controllers/apis/product");
const OrderController = require("../apps/controllers/apis/order");
const CommentController = require("../apps/controllers/apis/comment");
const CustomerAuthController = require("../apps/controllers/apis/customerAuth");

// Import Middleware
const { registerValidator } = require("../apps/middlewares/customerValidator");
const { verifyCustomer} = require("../apps/middlewares/orderAuth");
const { createOrderRules, createOrderValidator } = require("../apps/middlewares/orderValidator");


const {
  authRules,
  loginValidator,
} = require("../apps/middlewares/authValidator");
const {
  verifyAccessToken,
  verifyRefreshToken,
} = require("../apps/middlewares/customerAuth");

router.post(
  "/auth/customers/register",
  registerValidator,
  CustomerAuthController.register
);
router.post(
  "/auth/customers/login",
  authRules,
  loginValidator,
  CustomerAuthController.login
);
router.post("/auth/customers/logout", CustomerAuthController.logout);
router.post(
  "/auth/customers/refresh",
  verifyRefreshToken,
  CustomerAuthController.resfreshToken
);
router.get(
  "/auth/customers/me",
  verifyAccessToken,
  CustomerAuthController.getMe
);

router.get("/categories", CategoryController.findAll);
router.get("/categories/:id", CategoryController.findOne);
router.get("/products", ProductController.findAll);
router.get("/products/:id/comments", CommentController.findByProductId);
router.post("/products/:id/comments", CommentController.create);
router.get("/products/:id", ProductController.findOne);


router.post("/customers/orders",
  verifyCustomer,
  createOrderRules,
  createOrderValidator,
  createOrderValidator,
  OrderController.order);
router.get("/customers/orders", OrderController.findByCustomerID);
router.get("/customers/orders/:id", OrderController.findOne);
router.patch("/customers/orders/:id/cancel", OrderController.cancel);

module.exports = router;
