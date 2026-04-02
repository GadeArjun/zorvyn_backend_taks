const mongoose = require("mongoose");

const recentActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "LOGIN"],
      required: true,
    },
    entity: {
      type: String, // e.g., "TRANSACTION", "USER"
      required: true,
    },
    entityId: {
      type: mongoose.Types.ObjectId,
    },
    details: {
      type: String, // optional description
    },
  },
  {
    timestamps: true,
  }
);

const RecentActivity = mongoose.model("RecentActivity", recentActivitySchema);

exports.RecentActivity = RecentActivity;
