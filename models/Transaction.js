const { Schema, default: mongoose } = require("mongoose");

const transactionSchema = new Schema(
  {
    amount: {
      type: Number,
      require: true,
    },
    type: {
      enum: ["income", "expense"],
      require: true,
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
      require: true,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      require: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

exports.Transaction = Transaction;
