import { DataTypes, Model } from 'sequelize';
import type { Optional, NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.ts';
import type Post from './post.ts';
import type Comment from './comment.ts';

export interface LikeAttributes {
  id: number;
  userId: number;
  postId?: number | null;
  commentId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
  post?: Post;
  comment?: Comment;
}

export interface LikeCreationAttributes extends Optional<LikeAttributes, 'id' | 'postId' | 'commentId'> {}

export class Like extends Model<LikeAttributes, LikeCreationAttributes> implements LikeAttributes {
  public id!: number;
  public userId!: number;
  public postId!: number | null;
  public commentId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relation properties
  public post?: NonAttribute<Post>;
  public comment?: NonAttribute<Comment>;
}

Like.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'post_id',
    },
    commentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'comment_id',
    },
  },
  {
    sequelize,
    tableName: 'likes',
    timestamps: true,
    underscored: true,
  }
);

export default Like;