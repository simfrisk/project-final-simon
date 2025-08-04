import { Request, Response } from "express";
import { ClassModel } from "../models/Class";

export const getClasses = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await ClassModel.find().select("classTitle");

    return res.status(200).json({
      success: true,
      response: result,
      message: "Classes fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: null,
      message: "Failed to fetch classes."
    });
  }
};