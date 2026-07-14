import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase(): Promise<void> {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.MONGO_URI);
    console.log('Successfully connected to MongoDB database');
  } catch (error) {
    console.error('Failed to connect to MongoDB database:', error);
    process.exit(1);
  }
}
