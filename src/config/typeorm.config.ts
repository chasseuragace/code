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
  // Auto-run migrations on app start; safe for dev, acceptable for our deployment until we adopt a CLI pipeline
  migrationsRun: true,
  // In development, also synchronize to create base tables before migrations add indexes/constraints
  synchronize: process.env.NODE_ENV !== 'production',
};
