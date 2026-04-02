const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const { authRouter } = require("./routes/auth.routes");
const { userRouter } = require("./routes/user.routes");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

// auth route
app.use("/api/auth", authRouter);

//user route
app.use("/api/user", userRouter);

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
