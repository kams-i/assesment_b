import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';
import { generateTokens } from '../utils/utils.ts';
import User, { type UserCreationAttributes } from '../models/user.ts';
import type { Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const getAllUsersService = async (res: Response) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
        });
        return successResponse(res, codes.OK, 'Users fetched successfully.', users);
    } catch (err: any) {
        console.error('--- GET_ALL_USERS_SERVICE ERROR ---', err);
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, err.message || 'Failed to fetch users.');
    }
};

export const updateUserService = async (userId: number, updateData: Partial<UserCreationAttributes>) => {
    const user = await User.findByPk(userId);
    if (!user) {
        const error: any = new Error('User not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const allowedFields: (keyof UserCreationAttributes)[] = ['username', 'firstName', 'lastName', 'age', 'role'];
    for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
            user.set(field, updateData[field]);
        }
    }

    await user.save();

    return await User.findByPk(userId, {
        attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
    });
};

export const deleteUserService = async (userId: number) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'otpCode', 'otpExpiresAt'] },
    });

    if (!user) {
        const error: any = new Error('User not found.');
        error.statusCode = codes.NOT_FOUND;
        throw error;
    }

    const userData = user.get({ plain: true });

    await user.destroy();
    return userData;
};