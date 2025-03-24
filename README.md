# CS4218 Project (E-Commerce Web App) - AY2425 Sem 2

[![Run Tests](https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/workflows/main.yml/badge.svg)](https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/workflows/main.yml)

## Milestone 1

URL of GitHub workflow for CI: [https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/runs/13749856034](https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/runs/13749856034)

### Setting Up

1. Clone the repo
    ```sh
    git clone https://github.com/cs4218/cs4218-2420-ecom-project-team13.git
    ```

2. Install server dependencies
    ```sh
    npm install
    ```

3. Install client dependencies
    ```sh
    cd client
    npm install
    ```

4. Create a `.env` with your environment variables under the root directory.
    ```ml
    PORT = 6060
    DEV_MODE = test
    MONGO_URL = mongodb+srv://<db_user>:<db_password>@<host>/<db_name>
    JWT_SECRET = <insert jwt secret>
    BRAINTREE_MERCHANT_ID = <insert braintree merchant id>
    BRAINTREE_PUBLIC_KEY = <insert braintree public key>
    BRAINTREE_PRIVATE_KEY = <insert braintree private key>
    ```

5. Create another `.env` file under the `client` directory.
    ```ml
    REACT_APP_API = http://localhost:6060
    ```

6. Create a `.env.integration.test` with your sandboxed and testing environment variables under the root directory.
    ```ml
    PORT = 6060
    DEV_MODE = test
    MONGO_URL = mongodb+srv://<db_user>:<db_password>@<host>/<db_name>
    JWT_SECRET = <insert jwt secret>
    BRAINTREE_MERCHANT_ID = <insert braintree merchant id>
    BRAINTREE_PUBLIC_KEY = <insert braintree public key>
    BRAINTREE_PRIVATE_KEY = <insert braintree private key>
    ```

7. Create a `sonar-project.properties` with your sandboxed and testing environment variables under the root directory.
    ```ml
    # SonarQube server settings
    sonar.host.url=http://localhost:9000
    sonar.token=squ_df20309eefd2dec350d28dca56237b28089f665f # replace with your token

    # Project identification
    sonar.projectKey=econ
    sonar.projectName=econ
    sonar.projectVersion=1.0

    # Analysis settings
    sonar.sources=.

    # Coverage report path
    sonar.javascript.lcov.reportPaths=coverage/lcov.info

    # Specify JavaScript as the main language
    sonar.language=js

    # Limit analysis to JavaScript files in the specifiee sources
    sonar.inclusions=**/*.js

    sonar.exclusions=**/*.test.js, **/*.config.js, **/*.setup.js
    ```

### Usage

> Make sure that you are in the root directory when you run these commands.

`npm run dev`

- Runs the app in the development mode.
- Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

`npm run test` - Runs frontend and backend tests, one after the other, and the output goes to the terminal.

`npm run test:backend` - Runs backend tests only and the output goes to the terminal.\
`npm run test:frontend` - Runs frontend tests only and the output goes to the terminal.\
`npm run test:integration` - Runs integration tests in the backend only and the output goes to the terminal.

`npm run test:backend-no-cc` - Runs backend tests only and the output goes to the terminal without coverage.\
`npm run test:frontend-no-cc` - Runs frontend tests only and the output goes to the terminal without coverage.\
`npm run test:integration-no-cc` - Runs integration tests in the backend only and the output goes to the terminal without coverage.


> [!NOTE]
> If you encounter the following output result when you run `npm run test`, you can run `npm run test:frontend ; npm run test:backend` or run them individually.
> ```sh
> No tests found, exiting with code 0
> ----------|---------|----------|---------|---------|-------------------
> File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
> ----------|---------|----------|---------|---------|-------------------
> All files |       0 |        0 |       0 |       0 |                  
> ----------|---------|----------|---------|---------|-------------------
>```

# Generating SonarQube Report

1. Generate test coverage report for frontend, backend and integration
    * `npm run test:frontend`
    * `npm run test:backend`
    * `npm run test:integration`
2. Start sonarqube (in `cd /path/to/sonarqube`)
    * linux/macOS: `sonar.sh start`
    * windows: `StartSonar.bat`

3. Update sonar.token in `sonar-project.properties` with your own account's sonar token
4. Run sonar-scanner: `npm run sonarqube`