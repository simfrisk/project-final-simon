import { Project } from "../models/Projects";
import { Request, Response } from "express";

export const getProjectById = async (req: Request, res: Response): Promise<Response> => {

  const { projectId } = req.params

  try {
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Project was not found",
      })
    }
    return res.status(200).json({
      success: true,
      response: project,
      message: "The project was found"
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Project could not be found"
    })
  }

}