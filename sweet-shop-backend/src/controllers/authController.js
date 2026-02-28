const userService = require("../services/userService");

const register = async (req, res, next) => {
    try {
        const { user, token } = await userService.registerUser(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            user: { id: user.id, _id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified },
        });
    } catch (err) {
        if (err.message === "Email already in use") {
            return res.status(400).json({ error: err.message });
        }
        next(err);
    }
};

const login = async (req, res, next) => {
    try {
        const { user, token } = await userService.loginUser(req.body);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            user: { id: user.id, _id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified },
        });
    } catch (err) {
        if (err.message === "User not found" || err.message === "Invalid credentials" || err.message === "Account pending admin approval") {
            let statusCode = 400;
            if (err.message === "User not found") statusCode = 404;
            else if (err.message === "Account pending admin approval") statusCode = 403;

            return res.status(statusCode).json({ error: err.message });
        }
        next(err);
    }
};

const logout = (req, res) => {
    res.cookie('token', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

const updateProfile = async (req, res, next) => {
    try {
        const user = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            message: "Profile updated successfully",
            user: { id: user.id, _id: user.id, email: user.email, name: user.name, role: user.role, isVerified: user.isVerified }
        });
    } catch (err) {
        next(err);
    }
};

module.exports = {
    register,
    login,
    logout,
    updateProfile
};
