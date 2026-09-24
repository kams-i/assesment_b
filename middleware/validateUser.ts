import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import codes from "../utils/statusCodes.ts";
import { errorResponse } from "../utils/responses.ts";

// ==========================================
// 1. SCHEMAS & TYPES
// ==========================================

export const userSchema = z.object({
    username: z.string().min(1, "Username is required."),
    email: z.string().email("Invalid email address."),
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    age: z.number({ message: "Age is required." }),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

// Accepts either a single user object OR an array of users (with an optional wrapper object)
export const validateUsersPayloadSchema = z
    .union([userSchema, z.array(userSchema).nonempty("Payload array cannot be empty.")])
    .or(
        z.object({
            users: z.union([
                userSchema,
                z.array(userSchema).nonempty("Payload array cannot be empty."),
            ],
            )
        }).transform((data) => data.users)
    );

export type UserInput = z.infer<typeof userSchema>;

// ==========================================
// 2. CUSTOM REQUEST INTERFACE
// ==========================================

export interface CustomRequest extends Request {
    normalizedData?: any;
}

// ==========================================
// 3. VALIDATION MIDDLEWARE
// ==========================================

const validateUser = (req: CustomRequest, res: Response, next: NextFunction) => {
    const result = validateUsersPayloadSchema.safeParse(req.body);

    if (!result.success) {
        const errors = result.error.issues.map((err) => {
            const path = err.path.length > 0 ? `[Field: ${err.path.join(".")}] ` : "";
            return `${path}${err.message}`;
        });

        return errorResponse(res, codes.BAD_REQUEST, "Validation failed.", errors);
    }

    // Set the parsed & sanitized payload
    req.normalizedData = result.data;

    next();
};

export default validateUser;