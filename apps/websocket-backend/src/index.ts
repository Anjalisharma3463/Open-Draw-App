import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';

 
const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws , request) => {
  console.log("New client connected");
  const url = request.url;
  
  // ws://localhost:3000?token=12345
  
  //   url = ["ws://localhost:3000", "token:12345"].join("?"); // Example URL for testing
  if(!url) {
    ws.close(1008, "No URL provided");
    return;
  }
  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token");

    if(!token) {
        ws.close(1008, "No token provided");
        return;
    }
   
    const decoded = jwt.verify(token, JWT_SECRET);
    
      if (typeof decoded == "string"){
      ws.close(1008, "Invalid or malformed token.");
      return;
    }

    if (!decoded) {
        ws.close(1008, "Invalid token");
        return;
    }
    console.log(`Client connected with token: ${token}`);
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);

    ws.send(`Echo: ${message}`);
  }); 
});