const express = require("express");
const { protect, authorizeRole } = require("../middleware/auth.middleware");
const {
  updateUser,
  deleteUser,
  changeUserRole,
  resetPasswordByAdmin,
} = require("../controllers/user.controller");

const router = express.Router();

router.post("/update/:userId", protect, authorizeRole(["admin"]), updateUser);

router.delete("/delete/:userId", protect, authorizeRole(["admin"]), deleteUser);

router.post("/role/:userId", protect, authorizeRole(["admin"]), changeUserRole);

router.post(
  "/reset-password/admin/:userId",
  protect,
  authorizeRole(["admin"]),
  resetPasswordByAdmin
);

exports.userRouter = router;
