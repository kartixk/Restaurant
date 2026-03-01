const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();

const isDev = process.env.NODE_ENV !== 'production';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10_000 : 100,       // essentially unlimited in dev
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,               // completely skip in development
});

// Stricter limiter only enforced in production
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 10_000 : 20,
    message: 'Too many login attempts from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev,               // completely skip in development
});

// Use morgan to log HTTP requests via our winston logger
// const morganFormat = isDev ? "dev" : "combined";
// app.use(
//     morgan(morganFormat, {
//         stream: {
//             write: (message) => logger.info(message.trim()),
//         },
//     })
// );

const path = require('path');
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api', limiter);

app.use("/api/cart", require("./routes/cart"));
app.use("/api/products", require("./routes/products"));
app.use("/api/branches", require("./routes/branchRoutes"));
app.use("/api/auth", authLimiter, require("./routes/auth"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/reports", require("./routes/reports"));


app.get("/", (req, res) => res.send("Server Ready 🍬"));

app.all("*", (req, res, next) => {
    const AppError = require('./utils/AppError');
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
