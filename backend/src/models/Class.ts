import { Schema, model, Types } from "mongoose"

export interface ClassType {
  classTitle: string
  projects: Types.ObjectId[]
}

const ClassSchema = new Schema<ClassType>({
  classTitle: { type: String, required: true, maxlength: 100, trim: true },
  projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
})

export const ClassModel = model<ClassType>("Class", ClassSchema)
