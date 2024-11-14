import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token; // Access the cookie correctly
  try {
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
// decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.userId = decoded.id; // Set userId from the decoded token
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
