import mongoose from "mongoose";

interface Reply {
  replyId: number,
  reply: string,
  createdAt: Date,
  commentId: number
}

interface Comment {
  id: number,
  projectId: number,
  message: string,
  createdAt: Date,
  timeStamp: string,
  replies: Reply[]
}

interface Project {
  projectId: number;
  projectName: string;
  projectDescription?: string;
  video?: string;
  comments: Comment[];
}

const ReplySchema = new mongoose.Schema({
  replyId: Number,
  reply: String,
  createdAt: { type: Date, default: Date.now },
  commentId: Number
});

const CommentSchema = new mongoose.Schema({
  id: Number,
  projectId: Number,
  message: String,
  createdAt: { type: Date, default: Date.now },
  timeStamp: String,
  replies: [ReplySchema]

})

const ProjectSchema = new mongoose.Schema({
  projectId: {
    type: Number,
    required: true,
    unique: true
  },
  projectName: {
    type: String,
    required: true
  },
  projectDescription:
    String,
  video: String,
  comments: {
    type: [CommentSchema],
    default: []
  }
});

export const Project = mongoose.model("Project", ProjectSchema);