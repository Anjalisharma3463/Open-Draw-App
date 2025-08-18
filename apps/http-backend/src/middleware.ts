import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


export function AuthMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Auth Middleware triggered");
    // Usually the token is in the format: "Bearer <token>"
    const authHeader = req.headers["authorization"] ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : authHeader.trim();

    if (!token) {
       res.status(401).json({ error: "Unauthorized: No token provided" });
       return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string"){
      res.status(401).json({ error: "Invalid or malformed token." });
      return;
    }

    if (decoded && decoded.userId) {
      req.userId = decoded.userId;
      next();
     } else {
      res.status(401).json({ error: "Unauthorized: Invalid token" });
      return;  
    }
  } catch (err) {
     res.status(401).json({ error: "Unauthorized: Token verification failed" });
    return;
    }
}
