// services/messageService.ts
import { Message, User } from '../models/index';
import codes from '../utils/statusCodes';
import { Op } from 'sequelize';

export const sendMessageService = async (
    body: { content: string; receiverId: number },
    senderId?: number
) => {
    if (!senderId) {
        const error: any = new Error('User not authenticated.');
        error.statusCode = codes.UNAUTHORIZED;
        throw error;
    }

    const receiver = await User.findByPk(body.receiverId);
    if (!receiver) {
        const error: any = new Error('Receiver not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const message = await Message.create({
        content: body.content,
        senderId,
        receiverId: body.receiverId
    });

    const messageWithUsers = await Message.findByPk(message.id, {
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }
        ]
    });

    return messageWithUsers ? messageWithUsers.toJSON() : message.toJSON();
};

export const saveMessage = async (senderId: number, receiverId: number, content: string) => {
    const message = await Message.create({
        senderId,
        receiverId,
        content
    });

    const messageWithUsers = await Message.findByPk(message.id, {
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }
        ]
    });

    return messageWithUsers ? messageWithUsers.toJSON() : message.toJSON();
};

export const getConversationService = async (user1Id: number, user2Id: number) => {
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        },
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            },
            {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email', 'firstName', 'lastName']
            }
        ],
        order: [['createdAt', 'ASC']]
    });

    return messages.map(m => m.toJSON());
};

export const deleteMessageService = async (messageId: number, userId?: number, userRole?: string) => {
    const message = await Message.findByPk(messageId, {
        include: [
            {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email']
            }
        ]
    });

    if (!message) {
        const error: any = new Error('Message not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    if (userRole !== 'admin' && message.senderId !== userId) {
        const error: any = new Error('Unauthorized to delete this message.');
        error.statusCode = codes.FORBIDDEN;
        throw error;
    }

    const messageData = message.toJSON();
    await message.destroy();

    return messageData;
};

export const MessageService = {
    sendMessageService,
    saveMessage,
    getConversationService,
    deleteMessageService,
};

export const getAllUsersService = async (currentUserId: number) => {
    const users = await User.findAll({
        where: {
            id: { [Op.ne]: currentUserId }
        },
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
    });
    return users.map(u => u.toJSON());
};

export const getConversationContactsService = async (currentUserId: number) => {
    // 1. Find all messages where the current user is either sender or receiver
    const messages = await Message.findAll({
        where: {
            [Op.or]: [
                { senderId: currentUserId },
                { receiverId: currentUserId }
            ]
        },
        attributes: ['senderId', 'receiverId']
    });

    // 2. Extract unique user IDs that aren't the current user
    const contactIdsSet = new Set<number>();
    messages.forEach((msg) => {
        const data = msg.toJSON();
        if (data.senderId !== currentUserId) contactIdsSet.add(data.senderId);
        if (data.receiverId !== currentUserId) contactIdsSet.add(data.receiverId);
    });

    const contactIds = Array.from(contactIdsSet);

    if (contactIds.length === 0) {
        return [];
    }

    // 3. Fetch user details for those specific IDs
    const users = await User.findAll({
        where: {
            id: { [Op.in]: contactIds }
        },
        attributes: ['id', 'username', 'email', 'firstName', 'lastName']
    });

    return users.map(u => u.toJSON());
};