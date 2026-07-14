import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();
const envSchema = z.object({
    PORT: z.coerce.number().default(5000),
    MONGO_URI: z.string().min(1, 'MONGO_URI is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error('Environment configuration validation error:', parsedEnv.error.format());
    process.exit(1);
}
export const env = parsedEnv.data;
