import { Request, Response } from "express";
import { CommentModel } from "../models/Comment";
import { Reply } from "../models/Reply";
import { Project } from "../models/Projects";
import { ClassModel } from "../models/Class";

export const deleteClass = async (req: Request, res: Response) => {
  const { classId } = req.params;

  try {
    const foundClass = await ClassModel.findById(classId);
    if (!foundClass) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Class could not be found",
      });
    }

    // Step 1: Find all comments for this class
    const comments = await CommentModel.find({ classId });

    // Step 2: Delete all replies related to the comments
    const commentIds = comments.map(comment => comment._id);
    await Reply.deleteMany({ commentId: { $in: commentIds } });

    // Step 3: Delete comments
    await CommentModel.deleteMany({ classId });

    // Step 4: Delete projects associated with this class
    if (foundClass.projects && foundClass.projects.length > 0) {
      await Project.deleteMany({ _id: { $in: foundClass.projects } });
    }

    // Step 5: Delete the class
    await foundClass.deleteOne();

    return res.status(200).json({
      success: true,
      response: foundClass,
      message: "Class, its projects, comments, and replies were deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete class",
    });
  }
};