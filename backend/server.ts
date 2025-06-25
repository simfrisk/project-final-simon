import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { getHome } from "./endpoints/getHome";
import { getProjects } from "./endpoints/getProjects";
import { resetDatabase } from "./setup/resetDatabase";

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);

const port: number = parseInt(process.env.PORT || "8080");
const app: Application = express();

app.use(cors());
app.use(express.json());

resetDatabase()

// API Home Route
app.get("/", getHome(app));
app.get("/projects", getProjects);
app.post("/projects", postProject)

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});