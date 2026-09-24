import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import { sequelize } from '../config/database.ts';

// 1. Attributes interface matching DB columns
export interface CommentAttributes {
  id: number;
  content: string;
  userId?: number; // Foreign key from User relation
  postId?: number; // Foreign key from Post relation
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Attributes optional when calling Comment.create()
export interface CommentCreationAttributes extends Optional<CommentAttributes, 'id'> {}

// 3. Typed Model Class
export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: number;
  public content!: string;
  public userId!: number;
  public postId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comments',
    timestamps: true,
    underscored: true,
  }
);

export default Comment;