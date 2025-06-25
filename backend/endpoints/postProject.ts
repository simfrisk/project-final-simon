import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const postProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectName, projectDescription } = req.body;

    if (!projectName) {
      res.status(400).json({
        success: false,
        response: null,
        message: "Project name is required"
      });
      return;
    }

    const newProject = new Project({
      projectName,
      projectDescription
    });

    const savedNewProject = await newProject.save();

    if (!savedNewProject) {
      res.status(400).json({
        success: false,
        response: null,
        message: "Project could not be saved"
      });
      return;
    }

    res.status(201).json({
      success: true,
      response: savedNewProject,
      message: "Project created"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error,
      message: "Could not post project"
    });
  }
};