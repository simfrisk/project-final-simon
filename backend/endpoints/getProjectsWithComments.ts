import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const getProjectsWithComments = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { classId } = req.params;

    const result = await Project.find({ classId })
      .populate({
        path: 'comments',
        match: { commentType: 'question' },
        populate: {
          path: 'commentCreatedBy',
          select: 'name profileImage role',
        }
      })
      .select("projectName projectDescription video thumbnail comments");

    return res.status(200).json({
      success: true,
      response: result,
      message: "Projects fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch projects."
    });
  }
};