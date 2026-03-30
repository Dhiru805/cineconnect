import mongoose, { Schema, Document } from "mongoose";

export interface IProduction extends Document {
  project: mongoose.Types.ObjectId;
  producer: mongoose.Types.ObjectId;
  // Kanban board
  scenes: {
    _id?: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    location?: string;
    date?: Date;
    timeFrom?: string;
    timeTo?: string;
    cast: mongoose.Types.ObjectId[];
    crew: mongoose.Types.ObjectId[];
    status: "pending" | "scheduled" | "completed" | "cancelled";
    notes?: string;
    order: number;
  }[];
  // Crew assignments
  crewAssignments: {
    user: mongoose.Types.ObjectId;
    role: string;
    confirmed: boolean;
    callTime?: string;
  }[];
  // Milestones
  milestones: {
    title: string;
    dueDate?: Date;
    completed: boolean;
    notes?: string;
  }[];
  shootStartDate?: Date;
  shootEndDate?: Date;
  dailyCallSheets: {
    date: Date;
    location?: string;
    callTime?: string;
    notes?: string;
    generated: boolean;
  }[];
  status: "pre-production" | "production" | "post-production" | "completed";
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductionSchema = new Schema<IProduction>(
  {
    project: { type: Schema.Types.ObjectId, ref: "Project", required: true, unique: true },
    producer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scenes: [
      {
        title: { type: String, required: true },
        description: String,
        location: String,
        date: Date,
        timeFrom: String,
        timeTo: String,
        cast: [{ type: Schema.Types.ObjectId, ref: "User" }],
        crew: [{ type: Schema.Types.ObjectId, ref: "User" }],
        status: { type: String, enum: ["pending", "scheduled", "completed", "cancelled"], default: "pending" },
        notes: String,
        order: { type: Number, default: 0 },
      },
    ],
    crewAssignments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        role: String,
        confirmed: { type: Boolean, default: false },
        callTime: String,
      },
    ],
    milestones: [
      {
        title: String,
        dueDate: Date,
        completed: { type: Boolean, default: false },
        notes: String,
      },
    ],
    shootStartDate: Date,
    shootEndDate: Date,
    dailyCallSheets: [
      {
        date: Date,
        location: String,
        callTime: String,
        notes: String,
        generated: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ["pre-production", "production", "post-production", "completed"],
      default: "pre-production",
    },
  },
  { timestamps: true }
);

export const Production =
  mongoose.models.Production || mongoose.model<IProduction>("Production", ProductionSchema);
