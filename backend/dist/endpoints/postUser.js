"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postUser = void 0;
const user_1 = require("../models/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const postUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const profileImage = req.file?.path || req.body.profileImage;
        const allowedRoles = ["teacher", "student"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Allowed roles: ${allowedRoles.join(", ")}`,
            });
        }
        const salt = bcrypt_1.default.genSaltSync();
        const hashedPassword = bcrypt_1.default.hashSync(password, salt);
        const user = new user_1.UserModel({
            name,
            email,
            password: hashedPassword,
            role,
            profileImage,
        });
        await user.save();
        res.status(201).json({
            success: true,
            message: "User created",
            userId: user._id,
            profileImage: user.profileImage,
            accessToken: user.accessToken,
        });
    }
    catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(400).json({
            success: false,
            message: "Could not create user",
            errors: error,
        });
    }
};
exports.postUser = postUser;
