import express from 'express';
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

app.post('/signup', async (req, res) => {
const parsedData = CreateUserSchema.safeParse(req.body);
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


app.post('/signin',async(req , res) => {
  const parsedData = SignSchema.safeParse(req.body);
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
  const token = jwt.sign({
      userId: user.id
    }, JWT_SECRET)

  res.json({
    token
  });
})



app.post('/room', AuthMiddleware,async (req, res) => {
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
  })
  
} catch (error) {
  res.status(411).json({
    message:"Room already exists with this name. Choose a different name."
  })
}
})

app.listen(3001, () => {
  console.log('HTTP backend is running on port 3001');
}
);