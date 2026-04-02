const mongoose = require("mongoose");
const { Schema } = mongoose;

const transactionSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
    },
    transaction_date: {
      type: Date,
      default: new Date(),
      required: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

exports.Transaction = Transaction;
