import { 
    signInService, 
    signUpService, 
    refreshTokenService, 
    getOneUserService, 
    requestOtpService, 
    verifyOtpService 
} from '../services/authService.ts';
import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';
import type { Request, Response, NextFunction } from 'express';

export const signUp = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const result = await signUpService(req.body, res);
        return successResponse(res, codes.CREATED, 'User registered successfully.', result);
    } catch (error: unknown) {
        const err = error as { statusCode?: number; message?: string };
        const statusCode = err.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = err.statusCode ? err.message : 'An error occurred during user registration.';
        return errorResponse(res, statusCode, message || 'An error occurred during user registration.');
    }
};

export const signin = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const result = await signInService(req.body, res);
        return successResponse(res, codes.OK, 'Signed in successfully.', result);
    } catch (error: unknown) {
        console.error('--- SIGNIN ERROR DEBUG ---', error); // <--- Add this line
        const err = error as { statusCode?: number; message?: string };
        const statusCode = err.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = err.statusCode ? err.message : 'An error occurred during sign-in.';
        return errorResponse(res, statusCode, message || 'An error occurred during sign-in.');
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const { refreshToken } = req.body;

        const tokens = await refreshTokenService(refreshToken);
        return successResponse(res, codes.OK, 'Token refreshed successfully.', tokens);
    } catch (error: any) {
        const statusCode = error.statusCode || codes.INTERNAL_SERVER_ERROR;
        const message = error.message || 'An error occurred while refreshing the token.';
        return errorResponse(res, statusCode, message);
    }
};

export const getOneUser = async (req: Request & { user?: { id: number } }, res: Response): Promise<Response | void> => {
    try {
        const id = req.user?.id;
        if (!id) {
            return errorResponse(res, codes.UNAUTHORIZED, 'Unauthorized user.');
        }
        const user = await getOneUserService(id, res);
        return successResponse(res, codes.OK, 'User retrieved successfully.', user);
    } catch (error: unknown) {
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'An error occurred while retrieving the user.');
    }
};

export const requestOtpController = async (req: Request, res: Response): Promise<Response | void> => {
    try {
        const email = req.body.email; // <--- Extract the string directly
        const result = await requestOtpService(email, res);
        if (result) return result;

        return successResponse(res, codes.OK, 'OTP sent successfully to your email.');
    } catch (error: unknown) {
        console.error('CONTROLLER ERROR:', error); // Add this so you see future errors if any
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'An error occurred while requesting OTP.');
    }
};

export const verifyOtpController = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const { email, otp } = req.body;
        return await verifyOtpService(email, otp, res);
    } catch (err: unknown) {
        if (!res.headersSent) {
            next(err);
        }
    }
};