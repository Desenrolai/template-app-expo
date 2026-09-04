/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  collectCoverageFrom: ['App.tsx', '!**/node_modules/**'],
};
