"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postSession = void 0;
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const postSession = async (req, res) => {
    try {
        const user = await user_1.UserModel.findOne({ email: req.body.email });
        if (user && bcrypt_1.default.compareSync(req.body.password, user.password)) {
            res.json({
                userId: user._id,
                name: user.name,
                role: user.role,
                profileImage: user.profileImage,
                accessToken: user.accessToken,
            });
        }
        else {
            res.status(401).json({ notFound: true }); // better to return a 401 for auth failure
        }
    }
    catch (error) {
        console.error("❌ Error in postSession:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.postSession = postSession;
