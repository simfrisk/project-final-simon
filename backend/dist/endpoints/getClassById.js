"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassById = void 0;
const Class_1 = require("../models/Class");
const getClassById = async (req, res) => {
    const { classId } = req.params;
    try {
        const foundClass = await Class_1.ClassModel.findById(classId).select("classTitle");
        if (!foundClass) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "Class was not found",
            });
        }
        const { _id, classTitle } = foundClass;
        return res.status(200).json({
            success: true,
            response: { _id, classTitle },
            message: "Class found",
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            response: error,
            message: "Class could not be found",
        });
    }
};
exports.getClassById = getClassById;
