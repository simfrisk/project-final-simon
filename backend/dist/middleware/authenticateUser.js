"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateUser = void 0;
const user_1 = require("../models/user");
const authenticateUser = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(400).json({ error: "Authorization header missing" });
        }
        // Remove "Bearer " prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7); // removes first 7 characters
        }
        const user = await user_1.UserModel.findOne({ accessToken: token });
        if (!user) {
            return res
                .status(401)
                .json({ error: "Invalid or expired token", loggedOut: true });
        }
        req.user = user;
        next();
    }
    catch (err) {
        console.error("Authentication error:", err);
        res
            .status(500)
            .json({ error: "Internal server error during authentication" });
    }
};
exports.authenticateUser = authenticateUser;
