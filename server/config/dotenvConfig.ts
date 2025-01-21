import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const DATABASE=process.env.DATABASE || ""
export const DATABASE_PASSWORD=process.env.DATABASE_PASSWORD || ""
export const ENCRYPTION_KEY=process.env.ENCRYPTION_KEY || "who_are_you"
export const SALT_ROUNDS = process.env.SALT_ROUNDS || 200