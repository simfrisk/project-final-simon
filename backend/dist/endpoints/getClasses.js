"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClasses = void 0;
const Class_1 = require("../models/Class");
const getClasses = async (req, res) => {
    try {
        const result = await Class_1.ClassModel.find().select("classTitle");
        return res.status(200).json({
            success: true,
            response: result,
            message: "Classes fetched successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: null,
            message: "Failed to fetch classes."
        });
    }
};
exports.getClasses = getClasses;
