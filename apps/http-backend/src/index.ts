import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {CreateUserschema , SigninSchema , CreateRoomSchema} from "@repo/backend-common/types"


// if this request . userid is only for this file

// interface AuthRequest extends Request {
//   userId?: string;
// }



const app = express();

app.use(express.json());

app.post('/signup', (req, res) => {
const data = CreateUserschema.safeParse(req.body);
if (!data.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: data.error.errors
  });
  return;
}
const { username, password, name  } = data.data;


//db call
res.json({
  message: 'User signed up successfully'
})
return;
})


app.post('/signin', (req , res) => {
  const data = SigninSchema.safeParse(req.body);
if (!data.success) {
   res.status(400).json({
    error: 'Invalid input',
    details: data.error.errors
  });
  return;
}

  const token = jwt.sign({
    userId: data.userId
  }, JWT_SECRET)

  res.json({
    token
  });
})



app.post('/room', middleware ,(req , res) => {
  
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