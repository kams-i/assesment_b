import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { MessageService } from '../services/messageService.ts';

export function initSocket(server: HttpServer): SocketIOServer {
    const io = new SocketIOServer(server, {
        cors: {
            origin: ['http://localhost:3000', 'https://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST']
        }
    });

    const onlineUsers = new Map<string | number, string>();

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        socket.on('register', (userId: string | number) => {
            onlineUsers.set(userId, socket.id);
            onlineUsers.set(String(userId), socket.id); // ensure key consistency
            console.log(`Registered user ${userId} to socket ${socket.id}`);
        });

        socket.on('send_message', async (data: { senderId: number; receiverId: number; content: string }) => {
            const { senderId, receiverId, content } = data;
            console.log('Received send_message event:', data);

            try {
                const savedMessage = await MessageService.saveMessage(senderId, receiverId, content);

                const receiverSocketId = onlineUsers.get(receiverId) || onlineUsers.get(String(receiverId));
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('receive_message', savedMessage);
                }

                socket.emit('message_sent', savedMessage);
            } catch (error) {
                console.error('Failed to save or send message via socket:', error);
            }
        });

        socket.on('disconnect', () => {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                }
            }
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
}