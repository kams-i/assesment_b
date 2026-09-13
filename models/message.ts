import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.ts';

interface MessageAttributes {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface MessageCreationAttributes {
    senderId: number;
    receiverId: number;
    content: string;
    isRead?: boolean;
}

export class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
    public id!: number;
    public senderId!: number;
    public receiverId!: number;
    public content!: string;
    public isRead!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        senderId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        receiverId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: 'messages',
    }
);

export default Message;