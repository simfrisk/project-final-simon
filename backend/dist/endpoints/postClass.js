"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postClass = void 0;
const Class_1 = require("../models/Class");
const postClass = async (req, res) => {
    try {
        const { classTitle } = req.body;
        if (!classTitle) {
            return res.status(400).json({
                success: false,
                response: null,
                message: "Class title is required",
            });
        }
        const newClass = new Class_1.ClassModel({ classTitle });
        const savedNewClass = await newClass.save();
        return res.status(201).json({
            success: true,
            response: savedNewClass,
            message: "Class created successfully",
        });
    }
    catch (error) {
        console.error("Error in postClass:", error);
        if (error instanceof Error) {
            return res.status(500).json({
                success: false,
                response: null,
                message: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            response: null,
            message: "Unknown server error",
        });
    }
};
exports.postClass = postClass;
