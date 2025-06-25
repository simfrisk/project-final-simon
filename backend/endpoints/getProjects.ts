import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await Project.find();

    res.status(200).json({
      success: true,
      response: result,
      message: "Projects fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch projects."
    });
  }
};