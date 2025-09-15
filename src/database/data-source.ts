import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export const dataSourceOptions = {
  type: 'postgres' as const,
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  subscribers: [__dirname + '/subscribers/*{.ts,.js}'],
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
};

export const AppDataSource = new DataSource({
  ...dataSourceOptions,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'fintrack_db',
  // synchronize: process.env.NODE_ENV === 'development',
  synchronize: true,
  logging: process.env.NODE_ENV === 'development'
});
