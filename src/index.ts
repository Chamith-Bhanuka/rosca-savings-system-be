import express = require('express');
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.routes';
import groupRouter from './routes/group.routes';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { initSocket } from './server/socket';

dotenv.config();
const SERVER_PORT = process.env.SERVER_PORT;
const MONGODB_URI = process.env.MONGO_URI as string;

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/group', groupRouter);

app.use('/', (req, res) => {
  res.send('Backend is running..!');
});

const server = http.createServer(app);
initSocket(server);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

server.listen(5000, () => {
  console.log(`Server is running on port ${SERVER_PORT}`);
});
