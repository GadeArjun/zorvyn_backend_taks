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

/**
 * @swagger
 * tags:
 *   name: Transaction
 *   description: Transaction & Dashboard APIs
 */

/**
 * @swagger
 * /api/transaction:
 *   post:
 *     summary: Create a new transaction
 *     description: |
 *       Create a new transaction (income or expense).
 *
 *       🔐 **Authorization Required**
 *       - Role: `admin`
 *       - Requires Bearer Token
 *
 *       👉 Example:
 *       Bearer YOUR_JWT_TOKEN
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1200
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *                 example: expense
 *               category:
 *                 type: string
 *                 example: Groceries
 *               note:
 *                 type: string
 *                 example: Weekly shopping
 *               transaction_date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-02
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (only admin)
 */

/**
 * @swagger
 * /api/transaction:
 *   get:
 *     summary: Get all transactions with filters & pagination
 *     description: |
 *       Fetch transactions with filters.
 *
 *       🔐 Roles allowed:
 *       - admin
 *       - analyst
 *
 *       📌 Supports:
 *       - Filtering (type, category)
 *       - Date range
 *       - Pagination
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           example: 2026-04-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           example: 2026-04-30
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           example: 10
 *     responses:
 *       200:
 *         description: Transactions fetched successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/transaction/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     description: |
 *       Fetch a single transaction by ID.
 *
 *       🔐 Roles:
 *       - admin
 *       - analyst
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123abc123xyz456
 *     responses:
 *       200:
 *         description: Transaction found
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Transaction not found
 */

/**
 * @swagger
 * /api/transaction/update/{id}:
 *   post:
 *     summary: Update transaction
 *     description: |
 *       Update an existing transaction.
 *
 *       🔐 Rules:
 *       - Only admin
 *       - Only creator can update
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               amount: 1500
 *               category: Food
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/transaction/delete/{id}:
 *   delete:
 *     summary: Delete transaction (Soft delete)
 *     description: |
 *       Soft delete a transaction.
 *
 *       🔐 Rules:
 *       - Only admin
 *       - Only creator can delete
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Not authorized
 */

/**
 * @swagger
 * /api/transaction/dashboard/summary:
 *   get:
 *     summary: Get dashboard summary
 *     description: |
 *       Fetch dashboard analytics including:
 *
 *       📊 Metrics:
 *       - Total Income
 *       - Total Expense
 *       - Net Balance
 *       - Category Breakdown (income vs expense)
 *       - Monthly Trends
 *       - Weekly Trends
 *       - Recent Transactions
 *       - Recent Activities
 *
 *       🔐 Roles allowed:
 *       - admin
 *       - analyst
 *       - viewer
 *
 *       ⚡ Optimized with aggregation pipelines
 *     tags: [Transaction]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary fetched
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               data:
 *                 totalIncome: 1200
 *                 totalExpense: 800
 *                 netBalance: 400
 *                 categoryBreakdown:
 *                   - _id:
 *                       category: Groceries
 *                       type: expense
 *                     total: 800
 *                 monthlyTrends:
 *                   - _id:
 *                       month: 4
 *                       year: 2026
 *                       type: income
 *                     total: 1200
 *                 weeklyTrends: []
 *                 recentTransactions: []
 *                 recentActivity: []
 *       401:
 *         description: Unauthorized
 */

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
