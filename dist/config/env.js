import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().min(1, 'SMTP_FROM is required'),
    NEXT_PUBLIC_APP_URL: z.string().min(1, 'NEXT_PUBLIC_APP_URL is required'),
    RESEND_API_KEY: z.string().optional(),
    RESEND_SENDER_VERIFIED: z.string().optional(),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
}).refine(data => {
    if (!data.RESEND_API_KEY) {
        return !!data.SMTP_HOST && !!data.SMTP_USER && !!data.SMTP_PASS;
    }
    return true;
}, {
    message: "Either RESEND_API_KEY or (SMTP_HOST, SMTP_USER, SMTP_PASS) must be provided",
    path: ["RESEND_API_KEY"]
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Environment configuration validation error:', parsedEnv.error.format());
    process.exit(1);
}
export const env = parsedEnv.data;
