import { verifyToken } from "../security/jwt-utils.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).send({ message: "Authorization token required" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};

export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).send({ message: "Access denied" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).send({ message: "Access denied" });
    }
    return next();
  };
};
