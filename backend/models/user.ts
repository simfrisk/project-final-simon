import { Schema, Document, Types, model } from "mongoose"
import crypto from "crypto"

export interface UserType extends Document {
  _id: Types.ObjectId;
  name: string
  email: string
  password: string
  role: string
  accessToken: string
}

const UserSchema = new Schema<UserType>({
  name: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString("hex")
  }
})

export const UserModel = model<UserType>("User", UserSchema);

