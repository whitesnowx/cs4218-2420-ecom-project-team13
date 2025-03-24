import mongoose from "mongoose";
import orderModel from "../models/orderModel";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

describe("Order Model Integration Test", () => {
  const orderData = {
    products: [new mongoose.Types.ObjectId()],
    payment: { method: "Credit Card", status: "Paid" },
    buyer: new mongoose.Types.ObjectId(),
    status: "Not Processed",
  };
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

      await mongoose.connection.createCollection("orders");
    } catch (error) {
      console.error("Error setting up MongoDB Memory Server:", error);
    }
  });

  afterEach(async () => {
    await orderModel.deleteOne({ buyer: orderData.buyer });
  });

  afterAll(async () => {
    await mongoose.connection.db.collection("orders").deleteMany({});
    await mongoose.connection.close();
    await mongoose.disconnect();
    await mongoServer.stop();
  });


  it("should create and retrieve an order", async () => {
    const order = await orderModel.create(orderData);
    expect(order._id).toBeDefined();

    await order.save();

    const storedOrder = await orderModel.findById(order._id);
    expect(storedOrder.status).toBe("Not Processed");
    expect(storedOrder.products.length).toBe(1);
    expect(storedOrder.createdAt).toBeDefined();
    expect(storedOrder.updatedAt).toBeDefined();
  });

  it("should update an order status", async () => {
    const order = await orderModel.create(orderData);
    expect(order._id).toBeDefined();

    order.status = "Processing";
    await order.save();

    const updatedOrder = await orderModel.findById(order._id);
    expect(updatedOrder.status).toBe("Processing");
  });

  it("should delete an order", async () => {
    const order = await orderModel.create(orderData);

    await orderModel.findByIdAndDelete(order._id);
    const deletedOrder = await orderModel.findById(order._id);
    expect(deletedOrder).toBeNull();
  });
});
