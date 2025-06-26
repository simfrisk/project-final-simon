import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const getProjects = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await Project.find().select("projectName projectDescription");;

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