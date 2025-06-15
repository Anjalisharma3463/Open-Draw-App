import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';
import { middleware } from './middleware';



// if this request . userid is only for this file

// interface AuthRequest extends Request {
//   userId?: string;
// }



const app = express();

app.post('/signup', (req , res) => {
//db call
res.json({
  message: 'User signed up successfully'
})
})


app.post('/signin', (req , res) => {
  const userId = 1;

  const token = jwt.sign({
    userId
  }, JWT_SECRET)

  res.json({
    token
  });
})



app.post('/room', middleware ,(req , res) => {
  //db call
  res.json({
    roomId: '12345',
  })
})

app.listen(3000, () => {
  console.log('HTTP backend is running on port 3000');
}
);