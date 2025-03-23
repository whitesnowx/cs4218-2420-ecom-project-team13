import request from "supertest";
import app from "../server"; 
import mongoose from "mongoose";
import orderModel from "../models/orderModel.js";

let token = "";

jest.setTimeout(20000); // 20 seconds, adjust later


describe("Payment Integration Tests", () => {
    beforeAll(async () => {
        console.log("JWT Secret:", process.env.JWT_SECRET);

        const userCredentials = { email: "paymenttest@test.com", password: "test" };
        const authResponse = await request(app).post("/api/v1/auth/login").send(userCredentials);
        
        console.log("--> Login Response:", authResponse.body);
        console.log("--> Status Code:", authResponse.status); // 200 | Success
        token = authResponse.body.token; 
      });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("successfully fetch braintree token", async () => {
    const response = await request(app)
      .get("/api/v1/product/braintree/token")
      .set("Authorization", `Bearer ${token}`);

      console.log("Response:", response.body); 

    expect(response.status).toBe(200);
    expect(response.body.clientToken).toBeDefined();
  });

//   it("should process a payment successfully", async () => {
//     // Mock cart data
//     const cart = [
//       { name: "Product 1", price: 50 },
//       { name: "Product 2", price: 100 }
//     ];
    
//     const tokenResponse = await request(app)
//         .get("/api/v1/product/braintree/token")
//         .set("Authorization", `Bearer ${token}`);

//     const nonce = tokenResponse.body.clientToken; 
    
// console.log("retrieved clientToken:", nonce);

//     const response = await request(app)
//       .post("/api/v1/product/braintree/payment")
//       .set("Authorization", `Bearer ${token}`)
//       .send({ nonce, cart });

//     // expect(response.status).toBe(200);
//     // expect(response.body.ok).toBe(true);

//     // const savedOrder = await orderModel.findOne({ buyer: token.userId });
//     // expect(savedOrder).toBeTruthy();
//     // expect(savedOrder.products.length).toBe(cart.length);
//   });
});
