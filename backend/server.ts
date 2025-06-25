import express, { Application, Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { getHome } from "./endpoints/getHome";

const mongoUrl: string = process.env.MONGO_URL || "mongodb://localhost/final-project";
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

const port: number = parseInt(process.env.PORT || "8080", 10);
const app: Application = express();

app.use(cors());
app.use(express.json());

// API Home Route
app.get("/", getHome(app));

// Start the server
app.listen(port, (): void => {
  console.log(`Server running on http://localhost:${port}`);
});