import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  verbose: true,
  // Increase stability for migration-heavy tests and ensure sequential execution
  testTimeout: 30000,
  maxWorkers: 1,
  detectOpenHandles: true,
  forceExit: true,
};

export default config;
