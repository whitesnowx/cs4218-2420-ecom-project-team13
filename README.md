# CS4218 Project (E-Commerce Web App) - AY2425 Sem 2

[![Run Tests](https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/workflows/main.yml/badge.svg)](https://github.com/cs4218/cs4218-2420-ecom-project-team13/actions/workflows/main.yml)

## Milestone 1

URL of GitHub workflow for CI: <insert latest url here>

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
    DEV_MODE = development
    MONGO_URL = mongodb+srv://<db_user>:<db_password>@cs4218.yb4r9.mongodb.net/ecommerce
    JWT_SECRET = <insert jwt secret>
    BRAINTREE_MERCHANT_ID = <insert braintree merchant id>
    BRAINTREE_PUBLIC_KEY = <insert braintree public key>
    BRAINTREE_PRIVATE_KEY = <insert braintree private key>
    ```

5. Create another `.env` file under `\client`.
    ```ml
    REACT_APP_API = http://localhost:6060
    ```