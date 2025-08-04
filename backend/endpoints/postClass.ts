import { Request, Response } from "express";
import { ClassModel } from "../models/Class";

export const postClass = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        response: null,
        message: "Class title is required",
      });
    }

    const newClass = new ClassModel({ title });
    const savedNewClass = await newClass.save();

    return res.status(201).json({
      success: true,
      response: savedNewClass,
      message: "Class created successfully",
    });
  } catch (error) {
    console.error("Error in postClass:", error);

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