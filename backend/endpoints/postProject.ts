import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const postProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { projectName, projectDescription } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Project name is required",
      });
    }

    if (!req.file) {
      // Optional: if you require a video file for every project
      return res.status(400).json({
        success: false,
        response: null,
        message: "Video file is required",
      });
    }

    const videoUrl = (req.file as any)?.path || "";

    const newProject = new Project({
      projectName,
      projectDescription,
      video: videoUrl,
    });

    const savedNewProject = await newProject.save();

    return res.status(201).json({
      success: true,
      response: savedNewProject,
      message: "Project created",
    });
  } catch (error) {
    console.error("Error in postProject:", error);

    if (error instanceof Error) {
      // You can differentiate error types here if needed
      return res.status(500).json({
        success: false,
        response: null,
        message: error.message,
      });
    }

    // Fallback generic error response
    return res.status(500).json({
      success: false,
      response: null,
      message: "Unknown server error",
    });
  }
};