import request from "supertest";
import app from "../server"; 
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";
import jwt  from "jsonwebtoken";

let token = "";

// jest.setTimeout(20000); // 10 seconds, adjust later


describe("Payment Integration Tests", () => {
    beforeAll(async () => {
        const userCredentials = { email: "paymenttest@test.com", password: "test" };
        const authResponse = await request(app).post("/api/v1/auth/login").send(userCredentials);
        
        // console.log("--> Login Response:", authResponse.body);
        // console.log("--> Status Code:", authResponse.status); // 200 | Success
        token = authResponse.body.token; 
      });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("successfully fetch braintree token", async () => {
    const response = await request(app)
      .get("/api/v1/product/braintree/token")
      .set("Authorization", `${token}`);

      console.log("Response:", response.body); 

    expect(response.status).toBe(200);
    expect(response.body.clientToken).toBeDefined();
  });

  it("should process a payment successfully", async () => {
    const cart = [
        { _id: "660c2f9e8a9b8b001c4e45e9" },
        { _id: "660c2fa28a9b8b001c4e45ea" }
      ];
    
    const tokenResponse = await request(app)
        .get("/api/v1/product/braintree/token")
        .set("Authorization", `${token}`);

    const nonce = tokenResponse.body.clientToken; 
    
console.log("retrieved clientToken:", nonce);

    const response = await request(app)
      .post("/api/v1/product/braintree/payment")
      .set("Authorization", `${token}`)
      .send({ nonce, cart });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    
    // console.log("CHARIZARD: ", jwt.verify(token, process.env.JWT_SECRET))
    // console.log("token._id: ", jwt.verify(token, process.env.JWT_SECRET)._id)

    const savedOrder = await orderModel.findOne({ buyer: jwt.verify(token, process.env.JWT_SECRET)._id });
    expect(savedOrder).toBeTruthy();
    expect(savedOrder.products.length).toBe(cart.length);
  });
});
