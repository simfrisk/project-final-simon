import { Request, Response } from "express";
import { Reply } from "../models/Reply";

export const getReplies = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;

  try {
    const replies = await Reply.find({ commentId }); // Find replies linked to this comment

    return res.status(200).json({
      success: true,
      response: replies,
      message: "Replies fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch replies",
    });
  }
};