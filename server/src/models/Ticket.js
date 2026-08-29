import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    complaint: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Rejected"],
      default: "Open",
      index: true
    }
  },
  {
    timestamps: true,
    collection: "complaints"
  }
);

export default mongoose.model("Ticket", ticketSchema);
