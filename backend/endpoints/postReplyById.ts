import { Project } from "../models/Projects";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import type { ReplyType } from "../models/Reply";
import { Request, Response } from "express";
import { Types } from "mongoose";

export const postReplyById = async (req: Request, res: Response): Promise<Response> => {
  const { projectId, commentId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({
      success: false,
      response: null,
      message: "Reply text is required",
    });
  }

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project not found",
      });
    }

    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Comment not found",
      });
    }

    // Create and save the reply
    const newReply = new Reply({
      content: reply,
      commentId: comment._id,
      createdAt: new Date(),
    }) as ReplyType;
    await newReply.save();

    // Push reply _id to comment
    comment.replies.push(newReply._id as Types.ObjectId);
    await comment.save(); // ✅ You forgot this line

    return res.status(201).json({
      success: true,
      response: newReply,
      message: "Reply added to comment",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not add reply",
    });
  }
};