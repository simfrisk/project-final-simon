"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClasses = void 0;
const Class_1 = require("../models/Class");
/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Retrieve all classes
 *     description: Retrieve a list of classes with their titles.
 *     tags:
 *       - Classes
 *     responses:
 *       200:
 *         description: A list of classes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *                 message:
 *                   type: string
 *                   example: Classes fetched successfully
 *       500:
 *         description: Server error fetching classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: null
 *                   example: null
 *                 message:
 *                   type: string
 *                   example: Failed to fetch classes
 */
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
