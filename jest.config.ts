
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'v8',
  moduleFileExtensions: ['js', 'ts'],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  testMatch: [
    "**/__tests__/*test.+(ts|tsx|js)"
  ]
};