import { Request, Response } from "express";
import { Project } from "../models/Projects"


export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    let result = await Project.find()
    res.json(result)
  } catch (error) {
    console.error("Error fetching projects:", error)
    res.status(500).json({ error: "Failed to fetch projects." })
  }

}