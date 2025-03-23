import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import { categoryControlller, createCategoryController, deleteCategoryCOntroller, singleCategoryController, updateCategoryController } from "./categoryController.js"; // adjust the path as needed
import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { expect } from "@playwright/test";
import { jest } from "@jest/globals";

let app;
let mongod;

jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

beforeAll(async () => {
  // Start in-memory MongoDB
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  app = express();
  app.use(express.json());
  app.post("/api/v1/category/create-category", createCategoryController);
  app.put("/api/v1/category/update-category/:id", updateCategoryController);
  app.get("/api/v1/category/get-category", categoryControlller);
  app.get("/api/v1/category/single-category/:slug", singleCategoryController);
  app.delete("/api/v1/category/delete-category/:id", deleteCategoryCOntroller);
});

afterEach(async () => {
  // Clean up any data between tests
  await categoryModel.deleteMany({});
});

afterAll(async () => {
  // Disconnect and stop the in-memory MongoDB server
  await mongoose.disconnect();
  await mongod.stop();
});

describe("Integration Tests for Category Controllers", () => {
  describe("createCategoryController", () => {
    test("should return 401 if name is not provided", async () => {
      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send({});
  
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("message", "Name is required");
    });
  
    test("should create a new category successfully", async () => {
      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send({ name: "Test Category" });
  
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "new category created");
      expect(res.body.category).toHaveProperty("name", "Test Category");
      expect(res.body.category).toHaveProperty("slug", "test-category");
    });
  
    test("should return 409 if category already exists", async () => {
      await categoryModel.create({ name: "Duplicate", slug: "duplicate" });
  
      const res = await request(app)
        .post("/api/v1/category/create-category")
        .send({ name: "Duplicate" });
  
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("message", "Category Already Exists");
    });

    test("should return 500 if an error occurs", async () => {
        categoryModel.prototype.save = jest.fn(() => {
            throw new Error("Database Error");
        });

        const res = await request(app)
        .post("/api/v1/category/create-category")
        .send({ name: "new category"});

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Error in Category");
    });
  });



  describe("updateCategoryController", () => {
    test("should return 401 if name is not provided", async () => {
        const category = categoryModel.create({ name: "Electronics", slug: slugify("Electronics")});

        const res = await request(app)
        .put(`/api/v1/category/update-category/${category._id}`)
        .send({name: ""});

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("message", "Name is required");
    });

    test("should return 409 if category name is not unique", async () => {
        const category1 = await categoryModel.create({ name: "Books", slug: slugify("Books")});
        const category2 = await categoryModel.create({ name: "Electronics", slug: slugify("Electronics")});

        const res = await request(app)
        .put(`/api/v1/category/update-category/${category2._id}`)
        .send({ name: "Books"});

        expect(res.status).toBe(409);
        expect(res.body).toHaveProperty("message", "Category name must be unique");
    });

    test("should return 404 if category to update does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
        .put(`/api/v1/category/update-category/${nonExistentId}`)
        .send({ name: "Changed Category"});

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("message", "Category not found");
    });

    test("should update the category successfully", async () => {
        const category = await categoryModel.create({ name: "Electronics", slug: slugify("Electronics")});

        const res = await request(app)
        .put(`/api/v1/category/update-category/${category._id}`)
        .send({ name: "Books"});

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "Category Updated Successfully");
        expect(res.body.category).toHaveProperty("name", "Books");
        expect(res.body.category).toHaveProperty("slug", slugify("Books", {lower: true}));
    });
    
    test("should return 500 if an error occurs", async () => {
        categoryModel.findByIdAndUpdate = jest.fn(() => {
            throw new Error("Database Error");
        })

        const id = new mongoose.Types.ObjectId();
        const res = await request(app)
        .put(`/api/v1/category/update-category/${id}`)
        .send({ name: "changed Category"});

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Error while updating category");
    });

  });

  describe("categoryController", () => {
    test("should return 200 and a list of all categories when categories exist", async () => {
        await categoryModel.create({ name: "Books", slug: "books" });
        await categoryModel.create({ name: "Electronics", slug: "electronics" });
      
        const res = await request(app).get("/api/v1/category/get-category");
      
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "All Categories List");
        expect(res.body).toHaveProperty("category");
        expect(Array.isArray(res.body.category)).toBe(true);
        expect(res.body.category.length).toBe(2);
      });

      test("should return 200 and an empty list when no categories exist", async () => {
        const res = await request(app)
        .get("/api/v1/category/get-category");

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "All Categories List");
        expect(res.body).toHaveProperty("category");
        expect(Array.isArray(res.body.category)).toBe(true);
        expect(res.body.category.length).toBe(0);
      });
      
      test("should return 500 when an error occurs", async () => {
        categoryModel.find = () => {
            throw new Error("Database Error");
        };

        const res = await request(app)
        .get("/api/v1/category/get-category");

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Error while getting all categories");
      });
  });


  
  describe("singleCategoryController", () => {
    test("should return 200 and the single category if it exists", async () => {
      const categoryData = { name: "Electronics", slug: "electronics" };
      await categoryModel.create(categoryData);
  
      const res = await request(app).get("/api/v1/category/single-category/electronics");
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "Get Single Category Successfully");
      expect(res.body).toHaveProperty("category");
      expect(res.body.category).toHaveProperty("name", "Electronics");
      expect(res.body.category).toHaveProperty("slug", "electronics");
    });
  
    test("should return 404 if category does not exist", async () => {
      // Act: Send GET request for a slug that does not exist
      const res = await request(app).get("/api/v1/category/single-category/nonexistent");
  
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "Category not found");
    });

    test("should return 500 if an error occurs", async () => {
        categoryModel.findOne = jest.fn(() => {
            throw new Error("Database Error");
        })

        const res = await request(app)
        .get(`/api/v1/category/single-category/id`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Error While Getting Single Category");
    });
  });


  describe("deleteCategoryController", () => {
    test("should delete the category successfully", async () => {
        const category = await categoryModel.create({ name: "Books", slug: slugify("Books")});

        const res = await request(app)
        .delete(`/api/v1/category/delete-category/${category._id}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("message", "Category Deleted Successfully");
    });

    test("should return 404 if category does not exist", async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const res = await request(app)
        .delete(`/api/v1/category/delete-category/${nonExistentId}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Category not found");
    });
    
    test("should return 500 if there is an error during deletion", async () => {
        categoryModel.findByIdAndDelete = jest.fn(() => {
            throw new Error("Database error");
        });

        const id = new mongoose.Types.ObjectId();
        const res = await request(app).delete(`/api/v1/category/delete-category/${id}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "Error while deleting category");

    });

  });


});
