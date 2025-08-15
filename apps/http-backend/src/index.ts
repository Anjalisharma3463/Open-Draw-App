import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { AuthMiddleware } from './middleware';
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

const { username, password, name  } = parsedData.data;
try {

  await prismaClient.user.create({
    data : {
      email: username,
      password,
      name}
    })
    
    //db call
    res.json({
      message: 'User signed up successfully',
      userId: "123"
    })
  }  
  catch (error) {
   res.status(411).json({
    message : "User already exists"
   })
  }
})


app.post('/signin', (req , res) => {
  const data = SignSchema.safeParse(req.body);
if (!data.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: data.error.errors
  });
  return;
}
//db call for user authentication n getting user id
  const token = jwt.sign({
    userId: 1
  }, JWT_SECRET)

  res.json({
    token
  });
})



app.post('/room', AuthMiddleware, (req, res) => {
  const data = CreateRoomSchema.safeParse(req.body);
if (!data.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: data.error.errors
  });
  return;
}
  //db call
  res.json({
    roomId: '12345',
  })
})

app.listen(3000, () => {
  console.log('HTTP backend is running on port 3000');
}
);