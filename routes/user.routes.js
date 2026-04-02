const express = require("express");
const { protect, authorizeRole } = require("../middleware/auth.middleware");
const {
  updateUser,
  deleteUser,
  changeUserRole,
  resetPasswordByAdmin,
} = require("../controllers/user.controller");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User Management APIs (Admin only)
 */

/**
 * @swagger
 * /api/user/update/{userId}:
 *   post:
 *     summary: Update user details
 *     description: |
 *       Update user name and email.
 *
 *       🔐 **Authorization Required**
 *       - Role: `admin`
 *       - Requires Bearer Token
 *
 *       👉 Steps:
 *       1. Login as admin
 *       2. Click 🔒 Authorize
 *       3. Enter: Bearer YOUR_TOKEN
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123abc123xyz456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */

/**
 * @swagger
 * /api/user/delete/{userId}:
 *   delete:
 *     summary: Delete user (Soft delete)
 *     description: |
 *       Soft deletes a user by marking:
 *       - isDeleted = true
 *       - isActive = false
 *
 *       🔐 **Authorization Required**
 *       - Role: `admin`
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64f123abc123xyz456
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/role/{userId}:
 *   post:
 *     summary: Change user role
 *     description: |
 *       Update user role.
 *
 *       🎯 Allowed roles:
 *       - admin
 *       - analyst
 *       - viewer
 *
 *       🔐 Only admin can perform this action.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *                 example: analyst
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid role
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/user/reset-password/admin/{userId}:
 *   post:
 *     summary: Reset user password (Admin)
 *     description: |
 *       Admin can reset any user's password.
 *
 *       🔐 **Authorization Required**
 *       - Role: `admin`
 *
 *       🔒 Password will be hashed before storing.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: NewPass@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Password required
 *       404:
 *         description: User not found
 */

router
  .post("/update/:userId", protect, authorizeRole(["admin"]), updateUser)
  .delete("/delete/:userId", protect, authorizeRole(["admin"]), deleteUser)
  .post("/role/:userId", protect, authorizeRole(["admin"]), changeUserRole)
  .post(
    "/reset-password/admin/:userId",
    protect,
    authorizeRole(["admin"]),
    resetPasswordByAdmin
  );

exports.userRouter = router;
