import { UserModel } from "../models/user";
import bcrypt from "bcrypt";
import { Response, Request } from "express";

/**
 * @swagger
 * /session:
 *   post:
 *     summary: User login and create session
 *     tags:
 *       - Users
 *     security:                   
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: yourPassword123
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   example: 64da2f62f2a4a0a123456789
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 role:
 *                   type: string
 *                   example: teacher
 *                 profileImage:
 *                   type: string
 *                   example: /uploads/profile123.jpg
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized - invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notFound:
 *                   type: boolean
 *                   example: true
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export const postSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      res.json({
        userId: user._id,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
        accessToken: user.accessToken,
      });
    } else {
      res.status(401).json({ notFound: true }); // better to return a 401 for auth failure
    }
  } catch (error) {
    console.error("❌ Error in postSession:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};