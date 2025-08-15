import { Request, Response } from "express";
import { Project } from "../models/Projects";

export const patchProject = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { newName, newDescription } = req.body;

  try {
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "The project was not found"
      });
    }

    if (newName) project.projectName = newName;
    if (newDescription) project.projectDescription = newDescription;

    const updatedProject = await project.save();

    res.status(200).json({
      success: true,
      response: updatedProject,
      message: "The project was successfully updated"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      response: error instanceof Error ? error.message : "Unknown error",
      message: "Could not change project in the database"
    });
  }
};