"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchClass = void 0;
const Class_1 = require("../models/Class");
/**
 * @swagger
 * /classes/{classId}:
 *   patch:
 *     summary: Update an existing class's title
 *     tags:
 *       - Classes
 *     description: Allows an authenticated user to update the title of a class by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the class to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newTitle:
 *                 type: string
 *                 example: Updated Class Title
 *     responses:
 *       200:
 *         description: The class was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   $ref: '#/components/schemas/Class'
 *                 message:
 *                   type: string
 *                   example: The class was successfully updated
 *       404:
 *         description: Class not found
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
 *                   example: The class was not found
 *       500:
 *         description: Server error when updating the class
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 response:
 *                   type: string
 *                   example: Could not change class in the database
 *                 message:
 *                   type: string
 *                   example: Could not change class in the database
 */
const patchClass = async (req, res) => {
    const { classId } = req.params;
    const { newTitle } = req.body;
    try {
        const classDoc = await Class_1.ClassModel.findById(classId);
        if (!classDoc) {
            return res.status(404).json({
                success: false,
                response: null,
                message: "The class was not found"
            });
        }
        if (newTitle)
            classDoc.classTitle = newTitle;
        const updatedClass = await classDoc.save();
        res.status(200).json({
            success: true,
            response: updatedClass,
            message: "The class was successfully updated"
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            response: error instanceof Error ? error.message : "Unknown error",
            message: "Could not change class in the database"
        });
    }
};
exports.patchClass = patchClass;
