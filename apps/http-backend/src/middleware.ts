import { Request ,Response ,NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";


interface JwtPayload {
  userId: string
}

export function middleware(req: Request, res: Response, next: NextFunction) {
   const token = req.headers["authorization"] ?? "";
   const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload; 

   if(decoded) {
      req.userId = decoded.userId;
      next();
   }
   else{
    res.json({
      error: "Unauthorized"
    });
    return;
   }
}