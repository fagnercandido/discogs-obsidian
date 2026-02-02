/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^obsidian$': '<rootDir>/src/tests/__mocks__/obsidian.ts',
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
};
