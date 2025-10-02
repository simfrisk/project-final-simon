import { Request, Response } from "express"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     summary: Get a single user by ID
 *     description: Retrieve details of a specific user by their ID.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 response:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: "User found"
 *       404:
 *         description: User not found
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
 *                 message:
 *                   type: string
 *                   example: "User was not found"
 *       500:
 *         description: Server error fetching user
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
 *                 message:
 *                   type: string
 *                   example: "User could not be found"
 */
export const getUserById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params

    const user = await UserModel.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "User was not found",
      })
    }

    return res.status(200).json({
      success: true,
      response: user,
      message: "User found",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "User could not be found",
    })
  }
}
