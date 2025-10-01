import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { RefreshToken } from '../entities/RefreshToken';
import { PasswordReset } from '../entities/PasswordReset';
import { Notification } from '../entities/Notification';
import { NotificationPreferences } from '../entities/NotificationPreferences';

const {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  NODE_ENV = 'development',
} = process.env;

// Fallback defaults for local development
const host = DB_HOST || 'localhost';
const port = DB_PORT ? parseInt(DB_PORT, 10) : 5432;
const username = DB_USERNAME || 'postgres';
const password = DB_PASSWORD || 'your_password';
const database = DB_NAME || 'studybuddy_users';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  synchronize: false,
  logging: NODE_ENV === 'development' ? ['error', 'warn'] : false,
  entities: [
    User,
    RefreshToken,
    PasswordReset,
    Notification,
    NotificationPreferences,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const initializeDatabase = async (
  retries = 5,
  delay = 3000,
): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        console.log('✅ Database connection established successfully');
      }
      return;
    } catch (error: any) {
      console.error(
        `❌ Database connection failed (attempt ${attempt} of ${retries}): ${error.message}`,
      );
      if (attempt < retries) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await wait(delay);
      } else {
        console.error(
          '❌ Could not connect to the database after multiple attempts.',
        );
        process.exit(1);
      }
    }
  }
};

export const closeDatabase = async (): Promise<void> => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✅ Database connection closed');
  }
};
