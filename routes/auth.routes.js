const express = require("express");
const {
  createNewAdminUser,
  createNewUser,
  loginUser,
} = require("../controllers/auth.controller");
const { protect, authorizeRole } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 🔐 Authentication APIs (Login & User Creation)
 */

/**
 * @swagger
 * /api/auth/create/admin:
 *   post:
 *     summary: Create Admin User
 *     description: |
 *       Create a new admin account.
 *
 *       ⚠️ This is usually used only once (initial setup).
 *
 *       📌 Validation Rules:
 *       - Email must be valid
 *       - Password must contain:
 *         - Minimum 8 characters
 *         - 1 uppercase
 *         - 1 lowercase
 *         - 1 number
 *         - 1 special character
 *
 *       🔓 No authentication required
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Super Admin
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/create/user:
 *   post:
 *     summary: Create User (Admin only)
 *     description: |
 *       Create a new user under an admin.
 *
 *       🔐 Authorization Required:
 *       - Bearer Token
 *       - Role: **admin**
 *
 *       📌 Validation Rules:
 *       - Email must be valid
 *       - Password must be strong
 *       - Role must be one of:
 *         - admin
 *         - analyst
 *         - viewer
 *
 *       👉 Steps:
 *       1. Login as admin
 *       2. Copy token
 *       3. Click 🔒 Authorize
 *       4. Enter: Bearer YOUR_TOKEN
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: John User
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: User@123
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *                 example: analyst
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized (No token)
 *       403:
 *         description: Forbidden (Not admin)
 *       409:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login User
 *     description: |
 *       Login with email and password.
 *
 *       🎯 On success:
 *       - Returns JWT token
 *       - Use this token for all protected APIs
 *
 *       🔐 How to use token:
 *       1. Copy token
 *       2. Click 🔒 Authorize in Swagger
 *       3. Enter:
 *          Bearer YOUR_TOKEN
 *
 *       ⚠️ Notes:
 *       - Email must exist
 *       - Password must match
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: Email not found
 *       401:
 *         description: Invalid password
 */

router
  .post("/create/admin", createNewAdminUser)
  .post("/create/user", protect, authorizeRole(["admin"]), createNewUser)
  .post("/login", loginUser);

exports.authRouter = router;
