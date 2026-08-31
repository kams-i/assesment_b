import User from './user.ts';
import Post from './post.ts';
import Comment from './comment.ts';
import Like from './like.ts';
// import Follow from './follow.ts'

// Setup Associations
const setupAssociations = () => {
    // ----------------------------------------------------
    // 1. USER & POST (One-to-Many)
    // ----------------------------------------------------
    User.hasMany(Post, {
        foreignKey: 'userId',
        as: 'posts',
        onDelete: 'CASCADE',
    });
    Post.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // ----------------------------------------------------
    // 2. USER & COMMENT (One-to-Many)
    // ----------------------------------------------------
    User.hasMany(Comment, {
        foreignKey: 'userId',
        as: 'comments',
        onDelete: 'CASCADE',
    });
    Comment.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
    });

    // ----------------------------------------------------
    // 3. POST & COMMENT (One-to-Many)
    // ----------------------------------------------------
    Post.hasMany(Comment, {
        foreignKey: 'postId',
        as: 'comments',
        onDelete: 'CASCADE',
    });
    Comment.belongsTo(Post, {
        foreignKey: 'postId',
        as: 'post',
    });

    // ----------------------------------------------------
    // 4. LIKES ASSOCIATIONS
    // ----------------------------------------------------
    User.hasMany(Like, {
        foreignKey: 'userId',
        as: 'likes',
        onDelete: 'CASCADE',
    });
    Like.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user',
    });

    Post.hasMany(Like, {
        foreignKey: 'postId',
        as: 'likes',
        onDelete: 'CASCADE',
    });
    Like.belongsTo(Post, {
        foreignKey: 'postId',
        as: 'post',
    });

    Comment.hasMany(Like, {
        foreignKey: 'commentId',
        as: 'likes',
        onDelete: 'CASCADE',
    });
    Like.belongsTo(Comment, {
        foreignKey: 'commentId',
        as: 'comment',
    });
};

// Execute relationship configuration
setupAssociations();

export { User, Post, Comment, Like };