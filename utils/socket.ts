// src/services/socket.ts
import { io, Socket } from 'socket.io-client';

export const createSocketConnection = (userId: string): Socket => {
  const socket = io('http://10.0.2.2:3000', {
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('🟢 Socket conectado:', socket.id);
    socket.emit('join', userId); // entra na sala privada
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket desconectado');
  });

  socket.io.on('reconnect_attempt', () => {
    console.log('🔴 Tentando reconectar...');
  });
  
  socket.io.on('reconnect_error', (err) => {
    console.error('🔴 Erro ao reconectar:', err);
  });
  
  socket.io.on('reconnect', () => {
    console.log('🟢Reconectado com sucesso!');
    socket.emit('join', userId); // reentra na sala
  });
  

  return socket;
};
