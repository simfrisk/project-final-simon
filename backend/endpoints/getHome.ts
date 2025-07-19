import { Application, Request, Response } from "express";
import listEndpoints from "express-list-endpoints";

export const getHome = (app: Application) => (req: Request, res: Response): void => {
  const endpoints = listEndpoints(app);
  res.json({
    message: "Welcome to the Classymc API",
    endpoints,
  });
};