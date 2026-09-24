import {
  DataTypes,
  Model,
} from 'sequelize';
import type {
  Optional,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  NonAttribute,
} from 'sequelize';
import { sequelize } from '../config/database.ts';
import type User from './user.ts';
import type Comment from './comment.ts';
import type Like from './like.ts';

// 1. Updated attributes interface with userId
export interface PostAttributes {
  id: number;
  title: string;
  content: string;
  userId: number; // Foreign key linking to User model
  images?: string[];
  videos?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// 2. Creation attributes (id, images, and videos are optional on creation)
export interface PostCreationAttributes
  extends Optional<PostAttributes, 'id' | 'images' | 'videos'> {}

// 3. Typed Model Class
export class Post
  extends Model<PostAttributes, PostCreationAttributes>
  implements PostAttributes
{
  public id!: number;
  public title!: string;
  public content!: string;
  public userId!: number;
  public images!: string[];
  public videos!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Relation properties populated on eager loading
  public user?: NonAttribute<User>;
  public comments?: NonAttribute<Comment[]>;
  public likes?: NonAttribute<Like[]>;
  public likesCount?: NonAttribute<number>;

  // Optional Sequelize mixins for instance autocompletion
  public getComments!: HasManyGetAssociationsMixin<Comment>;
  public addComment!: HasManyAddAssociationMixin<Comment, number>;
  public getLikes!: HasManyGetAssociationsMixin<Like>;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id', // Maps userId to user_id in PostgreSQL
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    videos: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
    underscored: true,
  }
);

export default Post;