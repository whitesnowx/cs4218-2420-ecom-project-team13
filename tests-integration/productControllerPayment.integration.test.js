import request from "supertest";
import app from "../server"; 
import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import { hashPassword } from "../helpers/authHelper.js";
import orderModel from "../models/orderModel.js";
import jwt  from "jsonwebtoken";
import connectDB from "../config/db.js"
import { BiCategory } from "react-icons/bi";


let token;
let user;
let cart;

// jest.setTimeout(20000); // 10 seconds, adjust later


describe("Payment Integration Tests", () => {
  const password = "JeffPassword";
    beforeAll(async () => {
        const hashedPassword = await hashPassword(password);
      
        user = {
          name: "Jeff Test",
          email: "payment_test@test.com",
          password: hashedPassword,
          phone: "99991111",
          address: "Blk 17 Test Street 38",
          answer: "shopping",
          role: 0,
        };
        
        connectDB();
        await mongoose.connection.createCollection("users");
        // await mongoose.connection.createCollection("categories");

        const response = await userModel.create(user);
        

        const userCredentials = { email: "payment_test@test.com", password: "JeffPassword" };
        const authResponse = await request(app).post("/api/v1/auth/login").send(userCredentials);
        
        // console.log("--> Login Response:", authResponse.body);
        // console.log("--> Status Code:", authResponse.status); // 200 | Success
        token = authResponse.body.token; 
      });

  afterAll(async () => {
    await userModel.deleteOne({ email: user.email });
    await mongoose.connection.db.collection("users").deleteMany({});
    await mongoose.connection.close();
  });

  it("successfully fetch braintree token", async () => {
    const response = await request(app)
      .get("/api/v1/product/braintree/token")
      .set("Authorization", `${token}`);

    expect(response.status).toBe(200);
    expect(response.body.clientToken).toBeDefined();
  });

  it("should process a payment successfully", async () => {
    const category = new categoryModel({
      name: "Books",
      description: "All types of books"
    });
    await category.save();
    
    const product1 = new productModel({
      name: "Textbook",
      slug: "textbook",
      description: "A comprehensive textbook",
      price: 79.99,
      category: category._id,
      quantity: 100,
      shipping: true
    })
    const product2 = new productModel({
      name: "Notebook",
      slug: "notebook",
      description: "A handy notebook",
      price: 9.99,
      category: category._id,
      quantity: 20,
      shipping: true
    })
    await product1.save();
    await product2.save();
    
    cart = [product1, product2];
    
    const tokenResponse = await request(app)
        .get("/api/v1/product/braintree/token")
        .set("Authorization", `${token}`);

    const nonce = tokenResponse.body.clientToken; 
    
    const response = await request(app)
      .post("/api/v1/product/braintree/payment")
      .set("Authorization", `${token}`)
      .send({ nonce, cart });

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);

    const savedOrder = await orderModel.findOne({ buyer: jwt.verify(token, process.env.JWT_SECRET)._id });
    expect(savedOrder).toBeTruthy();
    expect(savedOrder.products.length).toBe(cart.length);
  });
});
