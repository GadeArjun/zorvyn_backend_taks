require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/db");
const { authRouter } = require("./routes/auth.routes");
const { userRouter } = require("./routes/user.routes");
const { transactionRouter } = require("./routes/transaction.routes");

const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");

// general API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // 150 req
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false,
});

const app = express();
app.use(express.json());
app.use(cors());
app.set("trust proxy", 1);
app.use(apiLimiter);

connectDB();

// auth route
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // only 10 requests (login/register)
  message: {
    success: false,
    message: "Too many login /sigup attempts. Try again later.",
  },
  standardHeaders: true, // return rate limit info in headers
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter, authRouter);

//user route
app.use("/api/user", userRouter);

// transaction route
app.use("/api/transaction", transactionRouter);

// swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// health route
app.get("/health", (req, res) => {
  res.json({
    message: "Ok",
    success: true,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});
