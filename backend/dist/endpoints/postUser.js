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
        const { name, email, password } = req.body;
        const salt = bcrypt_1.default.genSaltSync();
        const user = new user_1.UserModel({ name, email, password: bcrypt_1.default.hashSync(password, salt) });
        await user.save();
        res.status(201).json({
            success: true,
            message: "User created",
            id: user._id,
            accessToken: user.accessToken,
        });
    }
    catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(400).json({
            success: false,
            message: "Could not create user",
            errors: error
        });
    }
};
exports.postUser = postUser;
