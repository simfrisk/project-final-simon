import { Types } from "mongoose"
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Request, Response } from "express";

export const postReplyById = async (req: Request, res: Response): Promise<Response> => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Reply content is required",
    });
  }

  try {

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    const newReply = new Reply({
      content,
      commentId: comment._id,
      isChecked: false,
      replyCreatedBy: req.user?._id,
      replyLikes: [],

    });

    await newReply.save();

    await newReply.populate("replyCreatedBy", "name profileImage role");

    comment.replies.push(newReply._id as Types.ObjectId);
    await comment.save();

    return res.status(201).json({
      success: true,
      response: newReply,
      message: "Reply added to comment",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Could not add reply",
    });
  }
};