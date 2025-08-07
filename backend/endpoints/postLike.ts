import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Types } from "mongoose";

export const postLike = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not authenticated",
    });
  }

  const { commentId } = req.params;

  try {
    const comment = await CommentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    const hasLiked = comment.likes.includes(user._id);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== user._id.toString());
      user.likedComments = user.likedComments.filter(id => id.toString() !== comment._id.toString());
    } else {
      // Like
      comment.likes.push(user._id as Types.ObjectId);
      user.likedComments.push(comment._id as Types.ObjectId);
    }

    await comment.save();
    await user.save();

    return res.status(200).json({
      success: true,
      liked: !hasLiked,
      totalLikes: comment.likes.length,
      message: hasLiked ? "Comment unliked" : "Comment liked",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error toggling like",
    });
  }
};