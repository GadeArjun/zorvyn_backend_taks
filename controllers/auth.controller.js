const { User } = require("../models/User");
const {
  hashPassword,
  verifyPassword,
  generateToken,
  validatePassword,
  validateEmail,
} = require("../utils/auth.utils");

// create new admin user fucntion
exports.createNewAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password. This all fields are required",
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

    // password validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with these email already exists.",
      });
    }
    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "User create successfully. Login to access dashboard.",
      user,
    });
  } catch (err) {
    console.error(`Error while creating admin user, message: ${err.message}`, {
      err,
    });
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

// create new user only by admin user
exports.createNewUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "name, email, password and role. This all fields are required",
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

    // password validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        success: false,
        message: passwordCheck.message,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with these email already exists.",
      });
    }
    const hashedPassword = await hashPassword(password);
    const createdBy = req.user._id;

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      createdBy,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message:
        "User create successfully. Now you can share creadiantial to user to access dashboard.",
      user,
    });
  } catch (err) {
    console.error(`Error while creating user, message: ${err.message}`, {
      err,
    });
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

// login user

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isDeleted: false }).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email ID is wrong, check and try again.",
      });
    }

    const isVerify = await verifyPassword(password, user.password);
    if (!isVerify) {
      return res.status(400).json({
        success: false,
        message: "Password is wrong, check and try again.",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successfully!",
      token,
      user,
    });
  } catch (err) {
    console.error(`Error while login, message: ${err.message}`, { err });
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};
