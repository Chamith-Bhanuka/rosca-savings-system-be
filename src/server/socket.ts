import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: { origin: '*' },
    pingTimeout: 3000,
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers['authorization']
          ?.toString()
          .replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized.!'));
      const payload = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as any;
      socket.data.userId = payload.sub;
      socket.data.role = payload.role;
      next();
    } catch (error) {
      next(new Error('Unauthorized.!'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 socket connected', socket.id, socket.data.userId);

    const uid = socket.data.userId;
    socket.join(uid.toString());

    console.log('📦 rooms:', Array.from(socket.rooms));

    socket.emit('connected', { message: 'connected', userId: uid });

    socket.on('disconnect', (reason) => {
      console.log('disconnected', reason);
    });
  });

  return io;
}

export function getIo() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
