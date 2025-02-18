export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  transform: {
  },

  // which test to run
  testMatch: ["<rootDir>/config/*.test.js",
              "<rootDir>/controllers/*.test.js"
            ],

  // configure dotenv file
  setupFiles: ["dotenv/config"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["config/**"],
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
