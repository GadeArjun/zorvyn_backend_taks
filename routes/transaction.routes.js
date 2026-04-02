const express = require("express");
const router = express.Router();

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary,
} = require("../controllers/transaction.controller");

const { protect, authorizeRole } = require("../middleware/auth.middleware");

router
  .post("/", protect, authorizeRole(["admin"]), createTransaction)
  .get("/", protect, authorizeRole(["admin", "analyst"]), getTransactions)
  .get(
    "/dashboard/summary",
    protect,
    authorizeRole(["admin", "analyst", "viewer"]),
    getSummary
  )
  .get("/:id", protect, authorizeRole(["admin", "analyst"]), getTransactionById)
  .post("/update/:id", protect, authorizeRole(["admin"]), updateTransaction)
  .delete("/delete/:id", protect, authorizeRole(["admin"]), deleteTransaction);

exports.transactionRouter = router;
