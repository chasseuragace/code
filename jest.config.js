module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: { warnOnly: true, ignoreCodes: [2307] },
      useESM: false,
    }],
  },
  testRegex: '.*\\.(spec|test)\\.ts$',
  verbose: true,
};
