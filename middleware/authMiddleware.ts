import type { Request, Response, NextFunction } from 'express';
import jwt, { Secret } from 'jsonwebtoken';
import User from '../models/user.ts';
import { errorResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';

// 1. Define the shape of your JWT payload
interface DecodedToken {
    id: string | number;
    username?: string;
    email?: string;
    role?: string;
    iat?: number;
    exp?: number;
}

// 2. Extend Express's Request interface to include req.user
export interface AuthenticatedRequest extends Request {
    user?: any; // Replace 'any' with your User model instance type if available
}

export const authenticate = async (
    req: AuthenticatedRequest, 
    res: Response, 
    next: NextFunction
) => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const secret = (process.env.JWT_SECRET || 'my_secret') as Secret;
            const decoded = jwt.verify(token, secret) as DecodedToken;

            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                return errorResponse(res, codes.NOT_FOUND, 'User not found.');
            }
            
            return next();
        } catch (error) {
            console.log(error);
            return errorResponse(res, codes.UNAUTHORIZED, 'Not authorized, token failed.');
        }
    }

    if (!token) {
        return errorResponse(res, codes.UNAUTHORIZED, 'Not authorized, no token provided.');
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return errorResponse(
                res, 
                codes.FORBIDDEN, 
                `Role ${req.user ? req.user.role : 'unknown'} does not have permission to perform this action.`
            );
        }
        next();
    };
};