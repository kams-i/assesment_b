import User from "../models/user.ts";
import type { UserCreationAttributes, UserAttributes } from "../models/user.ts";
import { sequelize } from "../config/database.ts";

// Interface for pagination query options
export interface PaginationOptions {
    page?: number | string;
    limit?: number | string;
}

// Interface for structured pagination response
export interface PaginatedUsersResult {
    users: User[];
    pagination: {
        totalUsers: number;
        currentPage: number;
        totalPages: number;
        limit: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Interface for bulk user creation result
export interface BulkCreateUsersResult {
    success: boolean;
    count: number;
    users: Omit<UserAttributes, 'password'>[];
}

export const createUser = async (data: UserCreationAttributes): Promise<User> => {
    return await User.create(data);
};

export const createBulkUsers = async (
    usersData: UserCreationAttributes[]
): Promise<BulkCreateUsersResult> => {
    if (!usersData || usersData.length === 0) {
        throw new Error("User data array cannot be empty.");
    }

    return await sequelize.transaction(async (t) => {
        const createdUsers = await User.bulkCreate(usersData, {
            transaction: t,
            validate: true,         // Enforces model-level validations on all items
            individualHooks: true,  // Runs beforeCreate hooks (e.g., password hashing) on each record
        });

        const plainUserData = createdUsers.map((user) => {
            const { password, ...userWithoutPassword } = user.toJSON() as UserAttributes;
            return userWithoutPassword;
        });

        return {
            success: true,
            count: plainUserData.length,
            users: plainUserData,
        };
    });
};

export const getAllUsers = async (options: PaginationOptions = {}): Promise<PaginatedUsersResult> => {
    const { page = 1, limit = 10 } = options;

    // Parse and sanitize numerical pagination values
    const pageNum = Math.max(1, typeof page === "string" ? parseInt(page, 10) || 1 : page);
    const limitNum = Math.min(100, Math.max(1, typeof limit === "string" ? parseInt(limit, 10) || 10 : limit)); // Caps max limit at 100
    const offset = (pageNum - 1) * limitNum;

    // Fetch total count and sliced data in a single database query
    const { count: totalUsers, rows: users } = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset: offset,
    });

    const totalPages = Math.ceil(totalUsers / limitNum);

    return {
        users,
        pagination: {
            totalUsers,
            currentPage: pageNum,
            totalPages,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1,
        },
    };
};

export const getOneUser = async (id: number): Promise<User | null> => {
    const user = await User.findByPk(id);
    return user;
};

export const updateUser = async (
    id: number,
    updateData: Partial<UserAttributes>
): Promise<User | null> => {
    const [affectedCount] = await User.update(updateData, {
        where: { id },
    });

    if (affectedCount === 0) {
        return null;
    }

    return await User.findByPk(id);
};

export const deleteUser = async (id: number): Promise<UserAttributes | null> => {
    const user = await User.findByPk(id);
    if (!user) {
        return null;
    }

    const deletedUserData = user.toJSON() as UserAttributes;
    await user.destroy();
    return deletedUserData;
};