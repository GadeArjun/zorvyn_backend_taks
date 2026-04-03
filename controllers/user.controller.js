const { default: mongoose } = require("mongoose");
const { RecentActivity } = require("../models/RecentActivity");
const { User } = require("../models/User");
const {
  hashPassword,
  validateEmail,
  validatePassword,
} = require("../utils/auth.utils");

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // eamil validation
    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) {
      return res.status(400).json({
        success: false,
        message: emailCheck.message,
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { returnDocument: "after", runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (err) {
    console.error(`Error while updating user, message: ${err.message}`, {
      err,
    });
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const allowedRoles = ["viewer", "analyst", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // log
    await RecentActivity.create({
      user: req.user._id,
      action: "UPDATE",
      entity: "USER",
      entityId: user._id,
      details: "Update user's role",
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      user,
    });
  } catch (err) {
    console.error(`Error while updating role, message: ${err.message}`, {
      err,
    });
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true, isActive: false },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // log
    await RecentActivity.create({
      user: req.user._id,
      action: "DELETE",
      entity: "USER",
      entityId: user._id,
      details: "Delete user (Soft)",
    });

    return res.status(200).json({
      success: true,
      message: "User deleted (soft) successfully",
    });
  } catch (err) {
    console.error(`Error while deleting user, message: ${err.message}`, {
      err,
    });
    return res.status(500).json({
      success: false,
      message: err.message,
      error: err,
    });
  }
};

exports.resetPasswordByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // user id validation
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // password validation
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // log
    await RecentActivity.create({
      user: req.user._id,
      action: "UPDATE",
      entity: "USER",
      entityId: user._id,
      details: "Reset user's password",
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
