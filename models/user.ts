import { DataTypes, Model } from 'sequelize';
import type { Optional } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.ts';

// 1. Attributes interface matching DB columns
export interface UserAttributes {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    password: string;
    bio: string | null;
    role: 'admin' | 'user';
    otpCode?: string | null;
    otpExpiresAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

// 2. Attributes optional when calling User.create()
export interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role' | 'otpCode' | 'otpExpiresAt' | 'bio'> { }

// 3. Model class definition
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public declare id: number;
    public declare username: string;
    public declare email: string;
    public declare firstName: string;
    public declare lastName: string;
    public declare age: number;
    public declare password: string;
    public declare role: 'admin' | 'user';
    public declare otpCode: string | null;
    public declare otpExpiresAt: Date | null;
    public declare bio: string | null;

    public declare readonly createdAt: Date;
    public declare readonly updatedAt: Date;

    // TypeScript declarations for Sequelize association mixins
    public declare getFollowers: () => Promise<User[]>;
    public declare addFollower: (user: User | number) => Promise<void>;
    public declare removeFollower: (user: User | number) => Promise<void>;
    public declare hasFollower: (user: User | number) => Promise<boolean>;

    public declare getFollowing: () => Promise<User[]>;
    public declare addFollowing: (user: User | number) => Promise<void>;
    public declare removeFollowing: (user: User | number) => Promise<void>;
    public declare hasFollowing: (user: User | number) => Promise<boolean>;

    // Instance method to check passwords during login
    public async matchPassword(enteredPassword: string): Promise<boolean> {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Automatically hide password when user model is converted to JSON/sent to client
    public toJSON() {
        const { password, ...values } = this.get();
        return values;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 30],
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'first_name',
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            field: 'last_name',
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bio: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user',
        },
        otpCode: {
            type: DataTypes.STRING(6),
            allowNull: true,
            field: 'otp_code',
        },
        otpExpiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'otp_expires_at',
        },
    },
    {
        sequelize,
        tableName: 'users',
        timestamps: true,
        underscored: true,
        hooks: {
            beforeCreate: async (user: User) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user: User) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
        },
    }
);

export default User;