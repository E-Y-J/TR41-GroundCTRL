/** @type {import('jest').Config} */
module.exports = {
	testEnvironment: 'node',
	roots: ['<rootDir>'],
	testMatch: ['**/*.test.js'],
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	testTimeout: 30000,
	maxWorkers: process.env.CI ? 2 : undefined,
};
