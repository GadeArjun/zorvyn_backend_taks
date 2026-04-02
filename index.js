const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors);

app.get("/health", (req, res) => {
  res.json({
    message: "Ok",
    success: true,
  });
});

connectDB();
app.listen(process.env.PORT, () => {
  console.log(`server is running on http://localhost:${process.env.PORT}`);
});
