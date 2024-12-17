/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  resetMocks: false,
  setupFiles: ["<rootDir>/setup-jest.js", "jest-localstorage-mock"],
  setupFilesAfterEnv: ["<rootDir>/setup-env.js"],
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  collectCoverage: true,
};

module.exports = config;
