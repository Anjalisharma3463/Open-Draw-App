import ws, { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';

 
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: ws,
  userId: string,
  rooms: string[]
}


const users: User[] = [];

// user array:
// [
//   {
//     ws,
//     userId ,
//     rooms[]
//   },
//   {
//     ws,
//     rooms: [],
//     userId
//   }  
// ]




function checkUser(token: string): string | null{
 try {
     const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded == "string"){
      return null;
    }

    if (!decoded) {
        return null;
    }
    return decoded.userId; 
 } catch (error) {
  return null;
 }

 return null;
}

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

   const userId = checkUser(token);
   if(!userId){
       ws.close(1008, "Unauthorized");
       return null;
   }

   users.push({
    userId,
    rooms: [],
    ws
   })
    //Till now user have not joined any room thats why rooms array is empty.


    //whenever someone wants to join a room then message come from end client is like :
    
    

    // this is data in form of string
    // {
    //   type: "join_room",
    //   roomId: 1
    // }



   ws.on("message", (data) => {   

  const parsedData = JSON.parse(data as unknown as string)
  
  if(parsedData.type === "join_room"){
    const user = users.find( x => x.ws === ws);
    user?.rooms.push(parsedData.roomId);
  }  

  if(parsedData.type === "leave_room"){
    const user =  users.find(x => x.ws === ws);
    
    if(!user){
      return;
    }

    user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
  }

// {
//   type: "chat",
//   message:"hi there",
//   roomId: 123
// }
  if (parsedData.type === "chat"){
  const roomId = parsedData.roomId;
  const message = parsedData.message;  
  // check that the message that is sent to the room is exists or not in rooms array of each user.
  users.forEach(user => {
    if(user.rooms.includes(roomId) ){
      user.ws.send(JSON.stringify({
        type: "chat",
        message: message,
        roomId: roomId
      }))
    }
  })
  }


// user array:
// [
//   {
//     ws,
//     userId ,
//     rooms[]
//   },
//   {
//     ws,
//     rooms: [],
//     userId
//   }  
// ]



}); 
});