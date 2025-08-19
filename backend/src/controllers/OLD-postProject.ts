import { Request, Response } from "express"
import { Project } from "../models/Projects"

export const postProject = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { projectName, projectDescription } = req.body

    if (!projectName) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Project name is required",
      })
    }

    const newProject = new Project({ projectName, projectDescription })
    const savedNewProject = await newProject.save()

    return res.status(201).json({
      success: true,
      response: savedNewProject,
      message: "Project created",
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not post project",
    })
  }
}
