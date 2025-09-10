// import jwt from "jsonwebtoken";
// import { User } from "../models.js";

// export function authMiddleware(requiredRole = null) {
//   return async (req, res, next) => {
//     try {
//       const header = req.headers.authorization;
//       if (!header) return res.status(401).json({ error: "No token provided" });

//       const token = header.replace("Bearer ", "");
//       const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");

//       const user = await User.findByPk(decoded.id);
//       if (!user) return res.status(401).json({ error: "User not found" });

//       // Role check
//       if (requiredRole && user.role !== requiredRole) {
//         return res.status(403).json({ error: "Forbidden" });
//       }

//       req.user = user;
//       next();
//     } catch (err) {
//       console.error("Auth error:", err);
//       return res.status(401).json({ error: "Invalid token" });
//     }
//   };
// }
// import jwt from "jsonwebtoken";

// export function authMiddleware(requiredRole) {
//   return (req, res, next) => {
//     try {
//       const header = req.headers.authorization;
//       if (!header) return res.status(401).json({ error: "No token provided" });

//       const token = header.replace("Bearer ", "");
//       const data = jwt.verify(token, process.env.JWT_SECRET || "secret");

//       req.userId = data.id;
//       req.role = data.role;

//       if (requiredRole && data.role !== requiredRole) {
//         return res.status(403).json({ error: "Forbidden" });
//       }

//       next();
//     } catch (err) {
//       console.error("Auth error:", err);
//       return res.status(401).json({ error: "Invalid token" });
//     }
//   };
// }
import jwt from "jsonwebtoken";
export const authMiddleware = (requiredRole) => async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (requiredRole && decoded.role !== requiredRole) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.user = { id: decoded.id, role: decoded.role }; // <-- must set id
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};
