export default {
  // name displayed during tests
  displayName: "frontend",

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests

  testMatch: [
    "<rootDir>/client/src/components/Form/*.test.js",
    "<rootDir>/client/src/components/UserMenu.test.js",
    "<rootDir>/client/src/components/AdminMenu.test.js",
    "<rootDir>/client/src/context/*.test.js",
    "<rootDir>/client/src/hooks/*.test.js",
    "<rootDir>/client/src/pages/admin/*.test.js",
    "<rootDir>/client/src/pages/Auth/*.test.js",
    "<rootDir>/client/src/pages/user/*.test.js",
    "<rootDir>/client/src/pages/*.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/components/Form/**",
    "client/src/components/UserMenu.{js,jsx}",
    "client/src/components/AdminMenu.{js,jsx}",
    "client/src/context/auth.{js,jsx}", // Only covers auth in context
    "client/src/context/cart.{js,jsx}",
    "client/src/hooks/**",
    "client/src/pages/admin/**",
    "client/src/pages/Auth/**",
    "client/src/pages/user/**",
    "client/src/pages/Contact.{js,jsx}",
    "client/src/pages/Policy.{js,jsx}",
    "client/src/pages/CartPage.{js,jsx}"
  ],
  
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};