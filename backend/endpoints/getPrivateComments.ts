import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";

export const getPrivateComments = async (req: Request, res: Response): Promise<Response> => {
  const { projectId } = req.params;
  const userId = req.user?._id; // or however your user ID is stored

  if (!userId) {
    return res.status(401).json({
      success: false,
      response: null,
      message: "Unauthorized: User ID not found",
    });
  }

  try {
    const comments = await CommentModel.find({
      projectId,
      commentType: "private",
      commentCreatedBy: userId,
    })
      .populate("replies")
      .populate("commentCreatedBy", "name profileImage role");

    return res.status(200).json({
      success: true,
      response: comments,
      message: "Private comments by user fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch private comments",
    });
  }
};