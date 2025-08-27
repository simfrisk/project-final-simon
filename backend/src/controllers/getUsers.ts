import { Request, Response } from "express"
import { UserModel } from "../models/user"

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve all users
 *     description: Retrieve a list of all users in the system.
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 response:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error fetching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const result = await UserModel.find()

    return res.status(200).json({
      success: true,
      response: result,
      message: "Users fetched successfully",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
}
