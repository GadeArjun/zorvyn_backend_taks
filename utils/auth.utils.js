const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const validator = require("validator");

// validate email
exports.validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: "Email is required" };
  }

  if (!validator.isEmail(email)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true };
};

// validate password
exports.validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }

  const minLength = 8;
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]+$/;

  if (password.length < minLength) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!regex.test(password)) {
    return {
      valid: false,
      message:
        "Password must include uppercase, lowercase, number and special character",
    };
  }

  return { valid: true };
};

// generate token using user data

exports.generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY);
};

// decode tokem

exports.decodeToken = (token) => {
  return jwt.decode(token);
};

// hash password
exports.hashPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 10);
  return hashPassword;
};

// verify password
exports.verifyPassword = async (password, hashPassword) => {
  const verify = await bcrypt.compare(password, hashPassword);
  return verify;
};
