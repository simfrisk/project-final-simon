import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const postProject = async (req: Request, res: Response): Promise<Response> => {
  try {
    // Add these logs right at the start of your try block
    console.log("Received body:", req.body);
    console.log("Received file:", req.file);

    const { projectName, projectDescription } = req.body;

    if (!projectName) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Project name is required",
      });
    }

    if (!req.file) {
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
      return res.status(500).json({
        success: false,
        response: null,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      response: null,
      message: "Unknown server error",
    });
  }
};