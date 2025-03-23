import axios from "axios";
import mongoose from "mongoose";
import userModel from "../models/userModel";
import { hashPassword } from "../helpers/authHelper";
import { MongoMemoryServer } from "mongodb-memory-server";
import supertest from "supertest";
import app from "../server.js";
import JWT from "jsonwebtoken";

let mongoServer;

describe("Test the profile endpoints", () => {
  let user;
  const password = "password";
  let userId;
  let jwtToken;

  process.env.DEV_MODE === "test";
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
      const mongoUri = mongoServer.getUri();

      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await mongoose.connection.createCollection("users");

      console.log("MongoDB Memory Server Success");
    } catch (error) {
      console.error("Error setting up MongoDB Memory Server:", error);
    }
  });

  beforeEach(async () => {
    const hashedPassword = await hashPassword(password);

    user = {
      name: "newUser",
      email: "email@email.com",
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

  it("should be able to update existing user", async () => {
    const updatedUserData = {
      name: "newUser2",
      email: user.email,
      password: "password2",
      phone: "87654321",
      address: "321 address",
    };

    const res = await supertest(app)
      .put("/api/v1/auth/profile")
      .set("Authorization", jwtToken)
      .send(updatedUserData)
      .expect(200);

    const savedUser = await userModel.findOne({ _id: userId });

    expect(res.status).toBe(200);
    expect(savedUser).toBeDefined();
    expect(savedUser.name).toBe(updatedUserData.name);
    expect(savedUser.address).toBe(updatedUserData.address);
  });

  it("should return error when updating password with less than 6 characters", async () => {
    const updatedUserData = {
      name: user.name,
      email: user.email,
      password: "pass",
      phone: user.phone,
      address: user.address,
    };

    const res = await supertest(app)
      .put("/api/v1/auth/profile")
      .set("Authorization", jwtToken)
      .send(updatedUserData)
      .expect(400);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Password is required and 6 character long");
  });
});
