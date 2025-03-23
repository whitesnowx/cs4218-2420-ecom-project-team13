export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*.test.js",
    "<rootDir>/config/*.test.js",
    "<rootDir>/helpers/*.test.js",
    "<rootDir>/middlewares/*.test.js",
  ],
  // testPathIgnorePatterns: [
  //   "<rootDir>/.*\\.integration\\.test\\.js$"
  // ],

  // configure dotenv file to .env.test
  // setupFiles: ["<rootDir>/jest.backend.setup.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "controllers/**",
    "config/**",
    "helpers/**",
    "middlewares/**",
    "!**/*.integration.test.js"
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};

