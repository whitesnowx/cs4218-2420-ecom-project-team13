export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  transform: {},

  // which test to run
  // testMatch: ["<rootDir>/controllers/*.test.js"],
  testMatch: ["<rootDir>/controllers/productController.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
