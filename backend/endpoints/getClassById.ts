import { ClassModel } from "../models/Class";
import { Request, Response } from "express";

export const getClassById = async (req: Request, res: Response): Promise<Response> => {
  const { classId } = req.params;

  try {
    const foundClass = await ClassModel.findById(classId).select("classTitle");

    if (!foundClass) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Class was not found",
      });
    }

    const { _id, classTitle } = foundClass;

    return res.status(200).json({
      success: true,
      response: { _id, classTitle },
      message: "Class found",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Class could not be found",
    });
  }
};