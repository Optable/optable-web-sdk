/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/setupJest.js"],
};

module.exports = config;
