import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session." });
  }
}
