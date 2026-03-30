import mongoose, { Schema, Document } from "mongoose";

export interface IPlatformSettings extends Document {
  key: string;
  value: string;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
  },
  { timestamps: true }
);

export const PlatformSettings =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>("PlatformSettings", PlatformSettingsSchema);
