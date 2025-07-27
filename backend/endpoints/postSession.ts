import { UserModel } from "../models/user";
import bcrypt from "bcrypt";
import { Response, Request } from "express";

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