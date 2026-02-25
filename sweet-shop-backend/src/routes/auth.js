const express = require('express');
const router = express.Router();
const { validate } = require("../middleware/validate");
const { loginSchema, registerSchema } = require("../validators/authValidator");
const authController = require("../controllers/authController");
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs for auth routes
    message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/logout', authController.logout);

module.exports = router;