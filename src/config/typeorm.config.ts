import { DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'app_db',
  logging: false,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  migrations: [
    // Support both TS (dev) and JS (build) migrations
    __dirname + '/../**/migrations/*{.ts,.js}',
    __dirname + '/../../reference/migrations/*{.ts,.js}',
  ],
  // Only auto-run migrations in production; in development we prefer synchronize to create base tables first
  migrationsRun: process.env.NODE_ENV === 'production',
  // In development, synchronize to create base tables before any manual migrations
  synchronize: process.env.NODE_ENV !== 'production',
};
