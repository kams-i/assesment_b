import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { sequelize } from '../config/database.ts';

export interface FollowAttributes {
    id: number;
    followerId: number;
    followingId: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FollowCreationAttributes extends Optional<FollowAttributes, 'id'> { }

export class Follow extends Model<FollowAttributes, FollowCreationAttributes> implements FollowAttributes {
    public declare id: number;
    public declare followerId: number;
    public declare followingId: number;
    public declare readonly createdAt: Date;
    public declare readonly updatedAt: Date;
}

Follow.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        followerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'follower_id',
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        followingId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'following_id',
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    },
    {
        sequelize,
        tableName: 'follows',
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ['follower_id', 'following_id'], // Prevents duplicate follows
            },
            {
                fields: ['following_id'], // Speeds up queries looking for a user's followers
            },
            {
                fields: ['follower_id'],  // Speeds up queries looking for who a user is following
            },
        ],
    }
);

export default Follow;