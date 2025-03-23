export default {
  // display name
  displayName: "intergration",

  // when testing backend
  testEnvironment: "node",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  // which test to run
  testMatch: [
    "<rootDir>/tests-integration/*.integration.test.js"
  ],

  // configure dotenv file to .env.test
  setupFiles: ["<rootDir>/jest.integration.setup.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "**/*.integration.test.js"
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

