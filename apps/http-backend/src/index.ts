import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { AuthMiddleware } from './middleware.js';
import {CreateUserSchema , SignSchema , CreateRoomSchema} from "@repo/common/types"
// import prisma from "@repo/db/client"
import {prismaClient} from "@repo/db/client"

// if this request.userid is only for this file

// interface AuthRequest extends Request {
//   userId?: string;
// }



const app = express();

app.use(express.json());




app.use(cors({ origin: 'http://localhost:3001' })); 

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});


app.post('/auth/signup', async (req, res) => {
const parsedData = CreateUserSchema.safeParse(req.body);
// {
//   username: ZodString;
//     password: ZodString;
//     name: ZodString;
// }
console.log("Parsed data for signup from frontend :", parsedData);

if (!parsedData.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: parsedData.error.errors
  });
  return;
} 

try {
  
 const { username, password, name  } = parsedData.data; 
 const user = await prismaClient.user.create({
    data : {
      email: username,
      password,
      name}
    }) 

    res.json({
      message: 'User signed up successfully',
      userId: user.id
    })
  }  
  catch (error) { 
    
   res.status(411).json({
    message : "User already exists"
   })
  }
})


app.post('/auth/signin',async(req , res) => {
  const parsedData = SignSchema.safeParse(req.body);
  // {
  //    username: ZodString;
  //   password: ZodString;
  // }
if (!parsedData.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: parsedData.error.errors
  });
  return;
}
//db call for user authentication n getting user id
  const user = await prismaClient.user.findFirst({
    where: {
      email: parsedData.data.username,
      password: parsedData.data.password
    }
  })

  if(!user){
    res.status(403).json({
      message :"Not Authorized"
    });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token
  });
})



app.post('/create-room', AuthMiddleware,async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
if (!parsedData.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: parsedData.error.errors
  });
  return;
}

const userId = req.userId;
if (!userId) {
  res.status(401).json({ error: "Unauthorized: userId missing" });
  return;
}

try {
  const room = await prismaClient.room.create({
    data:{
      slug: parsedData.data.roomName,
      adminId: userId
    }
  })
   
  res.json({
    roomId: room.id,
    message: "Room created successfully"
  })
  
} catch (error) {
  res.status(411).json({
    message:"Room already exists with this name. Choose a different name."
  })
}
})


app.get("/chats/:roomId", AuthMiddleware, async (req, res) => {
  console.log("Fetching chats for roomId:", req.params.roomId);

  const roomId = Number(req.params.roomId);
  const userId = req.userId;
  console.log("req.params.roomId:", req.params.roomId);
  console.log("roomId:", roomId);

  if (!userId) {
    res.status(401).json({ error: "Unauthorized: userId missing" });
    return;
  }

  try {
    const messages = await prismaClient.chat.findMany({
      where: {
        roomId: roomId,
      },
      take: 50,
      orderBy: {
        id: 'desc'
      }
    });
    console.log("messages array: . ,",messages);
    
    res.json({
      messages
      
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve messages",
    });
  }
});


app.get("/room/:slug",AuthMiddleware, async (req, res) => {
  const roomSlug = req.params.slug;
  console.log("Fetched room slug:", roomSlug);
 console.log("type of room slug in room/slug room details :", typeof(roomSlug));
 
  try {
    const room = await prismaClient.room.findFirst({
      where: {
        slug: roomSlug,
      },
    });
    console.log("Room in room/slug in http backend: ",room);
    
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({ room });
  } catch (error) {
    console.log("error in room/slug/: ", error);

    res.status(500).json({ error: "Failed to retrieve room" });
  }
        });



        
    app.listen(3002, () => {
          console.log('HTTP backend is running on port 3002');
        }
        );
