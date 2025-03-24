export default {
  // display name
  displayName: "integration",

  // when testing backend
  testEnvironment: "node",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  // which test to run
  testMatch: [
    "<rootDir>/tests-integration/*.integration.test.js",
    "<rootDir>/controllers/*Integration.test.js"
  ],

  // configure dotenv file to .env.test
  setupFiles: ["<rootDir>/jest.integration.setup.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/components/Form/**",
    "client/src/components/**",
    "client/src/context/**",
    "client/src/hooks/**",
    "client/src/pages/admin/**",
    "client/src/pages/Auth/**",
    "client/src/pages/user/**",
    "client/src/pages/**",
    "controllers/**",
    "config/**",
    "helpers/**",
    "middlewares/**",
    "models/**",
    "routes/**",
    "!**/*.test.js"
  ],
  coverageThreshold: {
    global: {
      lines: 80,
      functions: 80,
    },
  },
};