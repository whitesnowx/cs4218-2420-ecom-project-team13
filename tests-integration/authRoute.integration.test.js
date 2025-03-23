import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import app from "../server.js";
import JWT from "jsonwebtoken";
import { expect } from "playwright/test";

let mongoServer;

describe("Auth Route Integration Test", () => {
    let user;
    const password = "password";
    let userId;
    let jwtToken;

    beforeAll(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }

        try {
            mongoServer = await MongoMemoryServer.create({
                instance: {
                    port: 27017,
                    dbName: "ecommerce-test",
                },
            });
            const uri = mongoServer.getUri();

            await mongoose.connect(uri);

            await mongoose.connection.createCollection("users");

            // console.log("MongoDB Memory Server Success");
        } catch (error) {
            console.error("Error setting up MongoDB Memory Server:", error);
        }
    });

    beforeEach(async () => {
        const hashedPassword = await hashPassword(password);

        user = {
            name: "newUser",
            email: "johndoe@email.com",
            password: hashedPassword,
            phone: "12345678",
            address: "123 address",
            answer: "safeAnswer",
            role: 0,
        };

        const response = await userModel.create(user);
        userId = response._id;
        jwtToken = await JWT.sign({ _id: response._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
    });

    afterEach(async () => {
        await userModel.deleteOne({ email: user.email });
    });

    afterAll(async () => {
        await mongoose.connection.db.collection("users").deleteMany({});
        await mongoose.connection.close();
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe("POST api/v1/auth/register", () => {
        it("should register a user successfully", async () => {
            // Arrange
            const newUser = {
                name: "John Doe",
                email: "johndoe@test.com",
                password: "johndoe123",
                phone: "98765432",
                address: "123 Main Street",
                answer: "answer"
            };

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/register")
                .send(newUser)
                .expect(201);

            // Assert
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("success");
            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("user");
            expect(response.body.user).toHaveProperty("email");
            expect(response.body.user.email).toBe(newUser.email);

            const storedUser = await userModel.findOne({ email: newUser.email });
            expect(storedUser).toBeDefined();
            expect(storedUser.name).toBe(newUser.name);
            expect(storedUser.email).toBe(newUser.email);
            expect(storedUser.phone).toBe(newUser.phone);
            expect(storedUser.address).toBe(newUser.address);
            expect(storedUser.answer).toBe(newUser.answer);
        });

        it("should return an error if name is missing", async () => {
            // Arrange
            const newUser = {
                email: "alicetan@test.com",
                password: "alicetan123",
                phone: "98765432",
                address: "123 Main Street",
                answer: "answer"
            };

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/register")
                .send(newUser)
                .expect(400);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("message");
            expect(response.body.message).toBe("Name is required");

            const storedUser = await userModel.findOne({ email: newUser.email });
            expect(storedUser).toBeNull();
        })
    });

    describe("POST api/v1/auth/login", () => {
        it("should login a user successfully", async () => {
            // Arrange

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/login")
                .send({
                    email: user.email,
                    password: password
                }).expect(200);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("login successfully");
            expect(response.body.user).toHaveProperty("email");
            expect(response.body.user.email).toBe(user.email);
        });

        it("should return invalid email or password if email is missing", async () => {
            // Arrange
            const loginUser = {
                password: password
            };

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/login")
                .send(loginUser)
                .expect(400);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid email or password");
        });

        it("should return invalid email or password if email is not registered", async () => {
            // Arrange
            const loginUser = {
                email: "alicetan@test.com",
                password: password
            };

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/login")
                .send(loginUser)
                .expect(404);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Email is not registered");
        });

        it("should return invalid password if password is incorrect", async () => {
            // Arrange
            const loginUser = {
                email: user.email,
                password: "wrongPassword"
            };

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/login")
                .send(loginUser)
                .expect(401);

            // Assert
            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Invalid Password");
        });
    });

    describe("POST api/v1/auth/forgot-password", () => {
        it("should reset a user's password successfully", async () => {
            // Arrange

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/forgot-password")
                .send({
                    email: user.email,
                    answer: user.answer,
                    newPassword: "newPassword"
                }).expect(200);

            // Assert
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Password Reset Successfully");
        });

        it("should return email is required if email is missing ", async () => {
            // Arrange
            const forgotPassUser = {
                answer: user.answer,
                newPassword: "newPassword"
            }

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/forgot-password")
                .send(forgotPassUser)
                .expect(400);

            // Assert
            expect(response.status).toBe(400);
            expect(response.body.message).toBe("Email is required");
        });
        
        it("should return wrong email or answer if email and answer don't match", async () => {
            // Arrange
            const forgotPassUser = {
                email: user.email,
                answer: "wrongAnswer",
                newPassword: "newPassword"
            }

            // Act
            const response = await supertest(app)
                .post("/api/v1/auth/forgot-password")
                .send(forgotPassUser)
                .expect(404);

            // Assert
            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe("Wrong Email Or Answer");
        });
    });
});
