const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// generate token using user data

exports.generateToken = (data) => {
  return jwt.sign(data, process.env.JWT_KEY);
};

// decode tokem

exports.decodeToken = (token) => {
  return jwt.decode(token);
};

// hash password
exports.hashPassword = async (passoword) => {
  const hashPassword = await bcrypt.hash(passoword, 10);
  return hashPassword;
};

// verify password
exports.verifyPassword = async (password, hashPassword) => {
  const verify = await bcrypt.compare(password, hashPassword);
  return verify;
};
