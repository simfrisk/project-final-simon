import { Schema, model, Types } from "mongoose";

export interface ClassType {
  title: string;
  projects: Types.ObjectId[];
}

const ClassSchema = new Schema<ClassType>({
  title: { type: String, required: true },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
});

export const ClassModel = model<ClassType>("Class", ClassSchema);