const { Transaction } = require("../models/Transaction");
const { RecentActivity } = require("../models/RecentActivity");
const { User } = require("../models/User");
const { default: mongoose } = require("mongoose");

exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, note, transaction_date } = req.body;

    if (!amount || !type) {
      return res.status(400).json({
        success: false,
        message: "Amount and type are required.",
      });
    }

    const transaction = await Transaction.create({
      amount,
      type,
      category,
      note,
      transaction_date,
      createdBy: req.user._id,
    });

    //  Recent Activity
    await RecentActivity.create({
      user: req.user._id,
      action: "CREATE",
      entity: "TRANSACTION",
      entityId: transaction._id,
      details: `Created ${type} of ${amount}`,
    });

    res.status(201).json({
      success: true,
      message: "Transaction record added successfully.",
      data: transaction,
    });
  } catch (err) {
    console.error(`Error while creating transaction, message: ${err.message}`, {
      err,
    });
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const { _id: userId, role } = req.user;

    let createdBy = [];

    if (role === "admin") {
      if (req.user.createdBy) {
        // admin with parent
        createdBy = [userId, req.user.createdBy];
      } else {
        // root admin
        createdBy = [userId];
      }
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // analyst → use createdBy (admin) id
      createdBy = [user.createdBy];
    }

    createdBy = createdBy.map((id) => new mongoose.Types.ObjectId(id));

    const query = {
      isDeleted: false,
      createdBy: { $in: createdBy }, // ✅ FIXED
    };

    if (type) query.type = type;
    if (category) query.category = category;

    if (startDate || endDate) {
      query.transaction_date = {};
      if (startDate) query.transaction_date.$gte = new Date(startDate);
      if (endDate) query.transaction_date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ transaction_date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      message: "Transaction record fetch successfully.",
      total,
      page: Number(page),
      data: transactions,
    });
  } catch (err) {
    console.error(`Error while fetching transaction, message: ${err.message}`, {
      err,
    });
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
    });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    // ✅ 2. Find transaction
    const transaction = await Transaction.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ✅ 4. Success
    res.json({
      success: true,
      data: transaction,
    });
  } catch (err) {
    console.error(`Error fetching transaction: ${err.message}`, { err });

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // ✅ 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    // ✅ 2. Find transaction
    const transaction = await Transaction.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ✅ 3. Ownership check (only creator can update)
    if (transaction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this transaction",
      });
    }

    // ✅ 4. Update
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      req.body,
      { returnDocument: "after", runValidators: true }
    );

    // 🔥 Activity
    await RecentActivity.create({
      user: userId,
      action: "UPDATE",
      entity: "TRANSACTION",
      entityId: updatedTransaction._id,
      details: "Updated transaction",
    });

    // ✅ 5. Response
    res.json({
      success: true,
      message: "Transaction record updated successfully.",
      data: updatedTransaction,
    });
  } catch (err) {
    console.error(`Error updating transaction: ${err.message}`, { err });

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // ✅ 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    // ✅ 2. Find transaction
    const transaction = await Transaction.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ✅ 3. Ownership check
    if (transaction.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this transaction",
      });
    }

    // ✅ 4. Soft delete
    await Transaction.findByIdAndUpdate(id, { isDeleted: true });

    // 🔥 Activity log
    await RecentActivity.create({
      user: userId,
      action: "DELETE",
      entity: "TRANSACTION",
      entityId: transaction._id,
      details: "Deleted transaction",
    });

    // ✅ 5. Response
    res.json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (err) {
    console.error(`Error deleting transaction: ${err.message}`, { err });

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const { _id: userId, role } = req.user;

    let createdBy = [];

    if (role === "admin") {
      if (req.user.createdBy) {
        createdBy = [userId, req.user.createdBy];
      } else {
        createdBy = [userId];
      }
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      createdBy = [user.createdBy];
    }

    createdBy = createdBy.map((id) => new mongoose.Types.ObjectId(id));

    const matchQuery = {
      isDeleted: false,
      createdBy: { $in: createdBy },
    };

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    endOfMonth.setHours(0, 0, 0, 0);

    const [
      totals,
      categoryData,
      monthlyTrends,
      weeklyTrends,
      recentTransactions,
      recentActivity,
    ] = await Promise.all([
      //  totals
      Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
          },
        },
      ]),

      //  category
      Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              category: "$category",
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
      ]),

      // monthly trends
      Transaction.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              month: { $month: "$transaction_date" },
              year: { $year: "$transaction_date" },
              type: "$type",
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // weekly transactions for current months
      Transaction.aggregate([
        {
          $match: {
            ...matchQuery,
            transaction_date: {
              $gte: startOfMonth,
              $lt: endOfMonth,
            },
          },
        },
        {
          $group: {
            _id: {
              week: { $isoWeek: "$transaction_date" },
              year: { $isoWeekYear: "$transaction_date" },
              type: "$type",
            },
            total: {
              $sum: "$amount",
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]),

      // recent transactions
      Transaction.find(matchQuery).sort({ createdAt: -1 }).limit(5).lean(),

      //recent activities
      RecentActivity.find({
        user: { $in: createdBy },
      })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    let income = 0,
      expense = 0;

    totals.forEach((item) => {
      if (item._id === "income") income = item.total;
      if (item._id === "expense") expense = item.total;
    });

    return res.json({
      success: true,
      message: "Dashboard summary fetch successfully.",
      data: {
        totalIncome: income,
        totalExpense: expense,
        netBalance: Math.max(income - expense, 0),
        categoryBreakdown: categoryData,
        monthlyTrends,
        weeklyTrends,
        recentTransactions,
        recentActivity,
      },
    });
  } catch (err) {
    console.error(`Error fetching dashboard: ${err.message}`, { err });

    res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again",
      error: err,
    });
  }
};
