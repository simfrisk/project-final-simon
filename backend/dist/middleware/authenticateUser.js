"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const user_1 = require("../models/user");
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(400).json({ error: "Authorization header missing" });
        }
        const user = await user_1.UserModel.findOne({ accessToken: token });
        if (!user) {
            return res.status(401).json({ error: "Invalid or expired token", loggedOut: true });
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error("Authentication error:", err); // Optional: for debugging/logging
        res.status(500).json({ error: "Internal server error during authentication" });
    }
};
exports.authenticateUser = authenticateUser;
