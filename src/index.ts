import express = require('express');
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRouter from './routes/auth.routes';
import groupRouter from './routes/group.routes';
import notificationRouter from './routes/notification.routes';
import paymentRouter from './routes/payment.routes';
import contributionRouter from './routes/contribution.routes';
import userRouter from './routes/user.routes';
import chatRouter from './routes/chat.routes';
import disputeRouter from './routes/disputes.routes';
import supportRouter from './routes/support.routes';
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
    origin: [
      'http://localhost:5173',
      'https://rosca-savings-system-fe.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(cookieParser());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/group', groupRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/contribution', contributionRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/dispute', disputeRouter);
app.use('/api/v1/support', supportRouter);

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
