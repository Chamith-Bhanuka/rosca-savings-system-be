import express = require('express');
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.routes';

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const MONGODB_URI = process.env.MONGO_URI as string;

const app = express();

app.use(express.json());

app.use('/api/v1/auth', authRouter);

app.use('/', (req, res) => {
  res.send('Backend is running..!');
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

app.listen(SERVER_PORT, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
