import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  type: "update" | "showreel" | "casting" | "achievement" | "bts";
  content: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  commentCount: number;
  comments?: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  tags?: string[];
  projectRef?: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["update", "showreel", "casting", "achievement", "bts"],
      default: "update",
    },
    content: { type: String, required: true },
    mediaUrl: String,
    mediaType: { type: String, enum: ["image", "video"] },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [String],
    projectRef: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

export const Post =
  mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
