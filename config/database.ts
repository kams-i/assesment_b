import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config();

const db = process.env.DATABASE_URL;

if (!db) {
    throw new Error('DATABASE_URL is not defined in environment variables.');
}

export const sequelize = new Sequelize(db, {
    dialect: 'postgres',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 10000 // Automatically cleans up stale/dead connections
    },
    dialectOptions: {
        keepAlive: true, // Prevents TCP timeout drops
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});