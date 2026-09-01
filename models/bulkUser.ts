import User, { UserCreationAttributes } from '../models/user.ts';
import { sequelize } from '../config/database.ts';

/**
 * Creates multiple users in a single managed database transaction.
 *
 * @param userDataArray - Array of user objects matching UserCreationAttributes
 * @returns Promise resolving to an array of created User instances
 */
export async function bulkCreateUsers(
    userDataArray: UserCreationAttributes[]
): Promise<User[]> {
    // Execute within a managed transaction
    return await sequelize.transaction(async (t) => {
        const createdUsers = await User.bulkCreate(userDataArray, {
            transaction: t,
            validate: true,         // Enforces model-level validations on all items
            individualHooks: true,  // Triggers beforeCreate hooks (e.g., password hashing) on each record
        });

        return createdUsers;
    });
}