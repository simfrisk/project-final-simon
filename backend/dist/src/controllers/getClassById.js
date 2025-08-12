"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClassById = void 0;
const Class_1 = require("../models/Class");
/**
 * @swagger
 * /classes/{classId}:
 *   get:
 *     summary: Get a single class by ID
 *     description: Retrieve details of a specific class by its ID.
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class to retrieve
 *     responses:
 *       200:
 *         description: Class found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     classTitle:
 *                       type: string
 *                 message:
 *                   type: string
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: null
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error when fetching class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: object
 *                 message:
 *                   type: string
 */
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
