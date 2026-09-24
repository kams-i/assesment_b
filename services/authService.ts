import { errorResponse, successResponse } from '../utils/responses.ts';
import codes from '../utils/statusCodes.ts';
import { generateTokens } from '../utils/utils.ts';
import User, { type UserCreationAttributes } from '../models/user.ts';
import type { Response } from 'express';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const getTransporter = () => {
    const user = process.env.EMAIL_USER?.trim();
    const pass = process.env.EMAIL_PASS?.trim().replace(/\s+/g, ''); // Strips any accidental whitespace

    if (!user || !pass) {
        throw new Error('EMAIL_USER or EMAIL_PASS environment variables are missing.');
    }

    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // SSL port 465
        auth: {
            user,
            pass,
        },
        authMethod: 'PLAIN',
    });
};

export const signUpService = async (userData: UserCreationAttributes, res: Response) => {
    const { username, email, firstName, lastName, age, password, role } = userData;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
        return errorResponse(res, codes.CONFLICT, 'Email is already registered.');
    }

    const user = await User.create({
        username,
        email,
        firstName,
        lastName,
        age,
        password,
        role: role || 'user',
    });

    if (!user) {
        return errorResponse(res, codes.INTERNAL_SERVER_ERROR, 'User registration failed.');
    }

    // Pass user.get({ plain: true }) here as well
    const tokens = generateTokens(user.get({ plain: true }));

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        age: user.age,
        role: user.role,
        ...tokens,
    };
};

export const signInService = async ({ email, password }: { email: string; password: string }, res: Response) => {
    const user = await User.findOne({ 
        where: { email },
        attributes: { include: ['password'] }
    });

    if (!user) {
        return errorResponse(res, codes.UNAUTHORIZED, 'Invalid email or password.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        return errorResponse(res, codes.UNAUTHORIZED, 'Invalid email or password.');
    }

    // Pass user.get({ plain: true }) so the properties are regular plain object keys
    const tokens = generateTokens(user.get({ plain: true })); 

    return {
        ...tokens,
    };
};
export const refreshTokenService = async (refreshToken: string) => {
    if (!refreshToken) {
        const error: any = new Error('Refresh token is required.');
        error.statusCode = codes.BAD_REQUEST;
        throw error;
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || '12345'
        ) as { id: number };
        
        console.log('--- DECODED TOKEN ID ---', decoded.id);

        const user = await User.findByPk(decoded.id);

        if (!user) {
            const error: any = new Error('User no longer exists.');
            error.statusCode = codes.UNAUTHORIZED;
            throw error;
        }

        return generateTokens(user);
    } catch (err: any) {
        console.error('--- REFRESH TOKEN VERIFY FAILED ---', err.message);
        
        // If it's already an error we created (like 'User no longer exists.'), throw it directly
        if (err.statusCode) {
            throw err;
        }

        // Otherwise it's a JWT verification error (expired, invalid signature, etc.)
        const error: any = new Error(`Invalid refresh token: ${err.message}`);
        error.statusCode = codes.UNAUTHORIZED;
        throw error;
    }
};

export const getOneUserService = async (userId: number, res: Response) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] },
    });

    if (!user) {
        return errorResponse(res, codes.NOT_FOUND, 'User not found.');
    }
    return user;
};

export const requestOtpService = async (emailInput: any, res: Response) => {
    const rawEmail = typeof emailInput === 'object' && emailInput !== null
        ? (emailInput.email || emailInput.body?.email)
        : emailInput;

    console.log('--- RAW EMAIL RECEIVED ---', rawEmail);

    if (!rawEmail || typeof rawEmail !== 'string') {
        return errorResponse(res, codes.BAD_REQUEST, 'Email is required.');
    }

    try {
        const fullEmail = rawEmail.toLowerCase().trim();

        // Strip +admin (or any +tag) before @ to find the base user in DB
        const cleanEmail = fullEmail.replace(/\+[^@]+(?=@)/, '');

        const user = await User.findOne({ where: { email: cleanEmail } });

        console.log('--- DEBUG USER FOUND ---', {
            email: user?.get('email'),
            role: user?.get('role')
        });

        if (!user) {
            return errorResponse(res, codes.NOT_FOUND, 'User with this email not found.');
        }

        const userRole = user.get('role');
        if (typeof userRole !== 'string' || userRole.toLowerCase() !== 'admin') {
            return errorResponse(
                res,
                codes.FORBIDDEN,
                'Access denied. Account does not have admin permissions.'
            );
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        user.set('otpCode', otp);
        user.set('otpExpiresAt', expiresAt);
        await user.save();

        const transporter = getTransporter();
        const emailUser = process.env.EMAIL_USER || '';

        console.log(`[SMTP Debug] Attempting email send from: ${emailUser}`);

        await transporter.sendMail({
            from: `"Admin Portal" <${emailUser.trim()}>`,
            to: fullEmail,
            subject: 'Your Admin Login OTP Code',
            html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Admin Single-Sign-On Code</h2>
          <p>Your one-time login verification code is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${otp}</p>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
        });

        return successResponse(res, codes.OK, 'OTP sent successfully to your email.');
    } catch (err: any) {
        console.error('--- REQUEST_OTP_SERVICE ERROR ---');
        console.error('MESSAGE:', err.message);
        console.error('STACK:', err.stack);
        console.error('--------------------------------');

        return errorResponse(
            res,
            codes.INTERNAL_SERVER_ERROR,
            err.message || 'Failed to send OTP.'
        );
    }
};

export const verifyOtpService = async (email: string, otp: string, res: Response) => {
    if (!email || !otp) {
        return errorResponse(res, codes.BAD_REQUEST, 'Email and OTP code are required.');
    }

    try {
        const fullEmail = email.toLowerCase().trim();
        // Strip +admin (or any +tag) so it looks up the base user just like request-otp did
        const cleanEmail = fullEmail.replace(/\+[^@]+(?=@)/, '');
        const cleanOtp = String(otp).trim();

        const user = await User.findOne({
            where: { email: cleanEmail }
        });

        if (!user) {
            return errorResponse(res, codes.NOT_FOUND, 'User not found.');
        }

        console.log('[OTP Debug] DB Code:', user.get('otpCode'), '| Received Code:', cleanOtp);
        console.log('[OTP Debug] DB Expiry:', user.get('otpExpiresAt'), '| Current Time:', new Date());

        const dbOtpCode = user.get('otpCode');
        if (!dbOtpCode || String(dbOtpCode) !== cleanOtp) {
            return errorResponse(res, codes.BAD_REQUEST, 'Invalid OTP code.');
        }

        const currentTime = new Date();
        const dbExpiry = user.get('otpExpiresAt');
        const expiryTime = dbExpiry ? new Date(dbExpiry as string | number | Date) : new Date(0);

        if (expiryTime < currentTime) {
            return errorResponse(res, codes.BAD_REQUEST, 'OTP code has expired.');
        }

        user.set('otpCode', null);
        user.set('otpExpiresAt', null);
        await user.save();

        const accessToken = jwt.sign(
            { id: user.get('id'), role: user.get('role') },
            process.env.JWT_SECRET || 'my_access_secret',
            { expiresIn: '1d' }
        );

        const refreshToken = jwt.sign(
            { id: user.get('id') },
            process.env.JWT_REFRESH_SECRET || '12345',
            { expiresIn: '7d' }
        );

        return successResponse(res, codes.OK, 'Verification successful.', {
            accessToken,
            refreshToken,
            user: {
                id: user.get('id'),
                email: user.get('email'),
                username: user.get('username'),
                role: user.get('role'),
            },
        });
    } catch (err: any) {
        console.error('--- VERIFY_OTP_SERVICE ERROR ---', err);
        return errorResponse(
            res,
            codes.INTERNAL_SERVER_ERROR,
            err.message || 'Verification failed.'
        );
    }
};