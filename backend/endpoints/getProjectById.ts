import { Project } from "../models/Projects";
import { Request, Response } from "express";

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {

  const { projectId } = req.params

  try {
    const project = await Project.findById(projectId).select("projectName projectDescription video");
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project was not found",
      })
    }
    const { _id, projectName, projectDescription, video, classId } = project;

    return res.status(200).json({
      success: true,
      response: { _id, projectName, projectDescription, video, classId },
      message: "Project found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Project could not be found"
    })
  }

}