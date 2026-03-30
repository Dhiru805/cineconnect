import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: "application" | "shortlisted" | "selected" | "rejected" | "contract" | "message" | "payment" | "follow" | "like" | "comment" | "system";
  title: string;
  body: string;
  link?: string;
  isRead: boolean;
  createdAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["application", "shortlisted", "selected", "rejected", "contract", "message", "payment", "follow", "like", "comment", "system"],
      required: true,
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    link: String,
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
