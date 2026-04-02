const express = require("express");
const {
  createNewAdminUser,
  createNewUser,
  loginUser,
} = require("../controllers/auth.controller");
const { protect, authorizeRole } = require("../middleware/auth.middleware");

const router = express.Router();

router
  .post("/create/admin", createNewAdminUser)
  .post("/create/user", protect, authorizeRole(["admin"]), createNewUser)
  .post("/login", loginUser);

exports.authRouter = router;
