const express = require("express");
const { authMiddleware } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { cartItemSchema, buyNowSchema, updateQuantitySchema } = require("../validators/cartValidator");
const cartController = require("../controllers/cartController");

const router = express.Router();

router.get("/", authMiddleware, cartController.getCart);

router.post(
  "/items",
  authMiddleware,
  validate(cartItemSchema),
  cartController.addOrUpdateItem
);

router.put(
  "/items/:sweetId",
  authMiddleware,
  validate(updateQuantitySchema),
  cartController.updateItemQuantity
);

router.delete("/items/:sweetId", authMiddleware, cartController.removeItem);

router.post("/confirm", authMiddleware, cartController.confirmOrder);

router.post(
  "/buy-now",
  authMiddleware,
  validate(buyNowSchema),
  cartController.buyNow
);

module.exports = router;