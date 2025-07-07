import { Request, Response } from "express";
import { Reply } from "../models/Reply";

export const deleteReply = async (req: Request, res: Response) => {
  const { replyId } = req.params;

  try {
    const reply = await Reply.findById(replyId);

    if (!reply) {
      return res.status(404).json({
        success: false,
        response: null,
        message: "Reply could not be found"
      });
    }

    await reply.deleteOne();

    return res.status(200).json({
      success: true,
      response: reply,
      message: "The reply was deleted"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      response: error,
      message: "Could not delete reply"
    });
  }
};