const { decodeToken } = require("../utils/auth.utils");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Your are not authorized to access. Please login to access.",
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error(`Error in auth middleware, message: ${err.message}`, { err });
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error. Please try again.",
      error: err,
    });
  }
};

exports.authorizeRole = (roles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;
      if (!userRole) {
        return res.json({
          success: false,
          message: "User role not found",
        });
      }

      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not authorized to perform this action.",
        });
      }

      next();
    } catch (err) {
      console.error(
        `Error in authorize roles middleware, message: ${err.message}`,
        {
          err,
        }
      );
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error. Please try again.",
        error: err,
      });
    }
  };
};
