import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './config';



// if this request . userid is only for this file

// interface AuthRequest extends Request {
//   userId?: string;
// }



const app = express();

app.post('/signup', (req , res) => {

})


app.post('/signin', (req , res) => {
  const userId = 1;

  const token = jwt.sign({
    userId
  }, JWT_SECRET)
})



app.post('/room', (req , res) => {
  
})

app.listen(3000, () => {
  console.log('HTTP backend is running on port 3000');
}
);