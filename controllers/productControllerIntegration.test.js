import express from "express";
import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import formidable from "express-formidable";
import fs from "fs";
import path from "path";
import { createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFiltersController, productListController, productPhotoController, realtedProductController, searchProductController, updateProductController } from "./productController.js"; // adjust the path as needed
import productModel from "../models/productModel.js";
import categoryModel from "../models/categoryModel.js";
import { expect } from "@playwright/test";

let app;
let mongod;

let testCategory, validProduct, mockProducts, photoTemplate;



// jest.spyOn(console, "error").mockImplementation(() => {});
// jest.spyOn(console, "log").mockImplementation(() => {});
  

beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    app = express();
    // app.use(formidable());

    app.post("/api/v1/product/create-product", formidable(), createProductController);
    app.get("/api/v1/product/get-product", getProductController);
    app.get("/api/v1/product/single-product/:slug", getSingleProductController);
    app.get("/api/v1/product/product-photo/:pid", productPhotoController);
    app.delete("/api/v1/product/delete-product/:pid", deleteProductController);
    app.put("/api/v1/product/update-product/:pid", formidable(), updateProductController);
    app.post("/api/v1/product/product-filters", productFiltersController);
    app.get("/api/v1/product/product-count", productCountController);
    app.get("/api/v1/product/product-list/:page", productListController);
    app.get("/api/v1/product/search/:keyword", searchProductController);
    app.get("/api/v1/product/related-product/:pid/:cid", realtedProductController);
    app.get("/api/v1/product/product-category/:slug", productCategoryController);

    
    testCategory = await categoryModel.create({name: "Test Category"});

    validProduct = {
        _id: "123",
        name: "Calculator",
        description: "A powerful calculator",
        price: 30,
        category: testCategory._id.toString(),
        quantity: 200,
        shipping: true,
        slug: "calculator",
        photo: {
          data: Buffer.from("mockImageData"),
          contentType: "image/jpeg",
        },
    };
      
    photoTemplate = {
        data: Buffer.from('mockImageData'),
        contentType: "image/jpeg"
    };
      
    mockProducts = [{
        name: "Product1", 
        slug: "product1", 
        description: "Product1's description", 
        price: 20, 
        category: testCategory._id.toString(), 
        quantity: 200, 
        shipping: true, 
        photo: { ...photoTemplate }
      },
      {
        name: "Product2", 
        slug: "product2", 
        description: "Product2's description", 
        price: 30.50, 
        category: testCategory._id.toString(), 
        quantity: 300, 
        shipping: true, 
        photo: { ...photoTemplate}
      },
      {
        name: "Product3", 
        slug: "product3", 
        description: "Product3's description", 
        price: 15, 
        category: testCategory._id.toString(), 
        quantity: 400, 
        shipping: true, 
        photo: { ...photoTemplate}
    }];

});

afterEach(async () => {
    await productModel.deleteMany({});
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongod.stop();
});

describe("Integration Tests for Product Controllers", () => {
    
    describe("createProductController", () => {
        test("should return error if required fields are missing", async () => {
            const res = await request(app)
            .post("/api/v1/product/create-product")
            .field("description", "product's description")
            .field("price", "100")
            .field("quantity", "10")
            .field("shipping", "true");

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Name is Required");
        });


        test("should create a new product successfully", async () => {
            const testImagePath = path.join(process.cwd(), "test-image.jpg");
            fs.writeFileSync(testImagePath, "dummy image content");

            const res = await request(app)
                .post("/api/v1/product/create-product")
                .field("name", "Test Product")
                .field("description", "A test product")
                .field("price", "100")
                .field("category", testCategory._id.toString())
                .field("quantity", "10")
                .field("shipping", "false")
                .attach("photo", testImagePath);

            fs.unlinkSync(testImagePath);

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("message", "Product Created Successfully");
            expect(res.body).toHaveProperty("products");
            expect(res.body.products).toHaveProperty("name", "Test Product");
            expect(res.body.products).toHaveProperty("category", testCategory._id.toString());
            expect(res.body.products).toHaveProperty("slug", "Test-Product");
        });

        test("should return 500 if an error occurs", async () => {

            productModel.prototype.save = jest.fn(() => {
                throw new Error("Database Error");
            });

            const testImagePath = path.join(process.cwd(), "test-image.jpg");
            fs.writeFileSync(testImagePath, "dummy image content");

            const res = await request(app)
                .post("/api/v1/product/create-product")
                .field("name", "Test Product")
                .field("description", "A test product")
                .field("price", "100")
                .field("category", testCategory._id.toString())
                .field("quantity", "10")
                .field("shipping", "false")
                .attach("photo", testImagePath);

            fs.unlinkSync(testImagePath);

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error in creating product");

            const productCount = await productModel.countDocuments({});
            expect(productCount).toBe(0);
            
        });

    });


    describe("getProductController", () => {

        test("should return 200 and a list of products when products exist", async() => {
            await productModel.create(mockProducts);

            const res = await request(app)
            .get("/api/v1/product/get-product");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("counTotal", 3);
            expect(res.body).toHaveProperty("products");
            expect(Array.isArray(res.body.products)).toBe(true);
            expect(res.body.products.length).toBe(3);
            
        });

        test("should return 200 and an empty list when no products exist", async () => {
            const res = await request(app)
            .get("/api/v1/product/get-product");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("counTotal", 0);
            expect(res.body).toHaveProperty("message", "AllProducts ");
            expect(Array.isArray(res.body.products)).toBe(true);
            expect(res.body.products.length).toBe(0);
        });

        test("should return 500 if an error occurs", async () => {

            productModel.find = jest.fn(() => {
                throw new Error("Database Error");
            });

            const res = await request(app).get("/api/v1/product/get-product");

            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error in getting products");
            
        });

    });

    describe("getSingleProductController", () => {
        test("should return 200 if the product is found", async () => {
            await productModel.create(mockProducts);

            const res = await request(app).get("/api/v1/product/single-product/product2");

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("message", "Single Product Fetched");
            expect(res.body).toHaveProperty("product");
            expect(res.body.product).toHaveProperty("name", "Product2");
            expect(res.body.product).toHaveProperty("slug", "product2");

        });

        test("should return 404 if product not found", async () => {
            const res = await request(app).get("/api/v1/product/single-product/nonexistent");
        
            expect(res.status).toBe(404);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Product not found");
        });

        test("should return 500 if a database error occurs", async () => {
            const originalFindOne = productModel.findOne;
            productModel.findOne = jest.fn(() => {
              throw new Error("Database Error");
            });
        
            const res = await request(app).get("/api/v1/product/single-product/product1");
        
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error while getitng single product");
            
            productModel.findOne = originalFindOne;
        });

    });
    

    describe("productPhotoController", () => {
        test("should return 200 if the photo exists", async () => {
            await productModel.create(mockProducts);
          
            const product2Doc = await productModel.findOne({ slug: "product2" });
            const { data: photoBuffer, contentType } = product2Doc.photo;
          
            const res = await request(app)
              .get(`/api/v1/product/product-photo/${product2Doc._id}`)
              .buffer(true)
              .parse((res, callback) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => callback(null, Buffer.concat(chunks)));
              });
          
            expect(res.status).toBe(200);
            expect(res.headers["content-type"]).toBe(contentType);
            expect(Buffer.compare(res.body, photoBuffer)).toBe(0);
        });
          
          
    });

    
    describe("deleteProductController", () => {
        test("should delete an existing product successfully", async () => {
            await productModel.create(mockProducts);

            const product2Doc = await productModel.findOne({slug: "product2"});
            const res = await request(app).delete(`/api/v1/product/delete-product/${product2Doc._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("message", "Product Deleted successfully");

            const foundProduct = await productModel.findById(product2Doc._id);
            expect(foundProduct).toBeNull();
        });

        test("should return 200 even if product does not exist", async () => {
            // 1. Generate a valid but non-existent ObjectId
            const nonExistentId = new mongoose.Types.ObjectId();
        
            // 2. Attempt to delete a non-existent product
            const res = await request(app).delete(`/api/v1/product/delete-product/${nonExistentId}`);
        
            // 3. The current controller always returns 200 if no error is thrown
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("message", "Product Deleted successfully");
        });


        test("should return 500 if a database error occurs", async () => {
            const originalFindByIdAndDelete = productModel.findByIdAndDelete;
            productModel.findByIdAndDelete = jest.fn(() => {
              throw new Error("Database Error");
            });
        
            const id = new mongoose.Types.ObjectId();
            const res = await request(app).delete(`/api/v1/product/delete-product/${id}`);
        
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error while deleting product");
        
            productModel.findByIdAndDelete = originalFindByIdAndDelete;
        });

    });


    describe("updateProductController", () => {

        test("should update the product successfully", async () => {
            let testProduct = await productModel.create({
                name: "Old Product",
                description: "Old description",
                price: 100,
                category: testCategory._id.toString(),
                quantity: 50,
                shipping: false,
                slug: "old-product",
                photo: {
                  data: Buffer.from("oldImageData"),
                  contentType: "image/jpeg",
                },
            });

            const updateData = {
                name: "Updated Product",
                description: "Updated Description",
                price: "120",
                category: testCategory._id.toString(),
                quantity: "100",
                shipping: "false",
            };

            const testImagePath = path.join(process.cwd(), "update-image.jpg");
            fs.writeFileSync(testImagePath, "new image");

            const response = await request(app)
            .put(`/api/v1/product/update-product/${testProduct._id}`)
            .field(updateData)
            .attach("photo", testImagePath);

            const updatedProduct = await productModel.findById(testProduct._id);
            expect(updatedProduct.name).toBe(updateData.name);
            expect(updatedProduct.price).toBe(Number(updateData.price));

        });

        test("should return error if required fields are missing", async () => {

            let testProduct = await productModel.create({
                name: "Old Product",
                description: "Old description",
                price: 100,
                category: testCategory._id.toString(),
                quantity: 50,
                shipping: false,
                slug: "old-product",
                photo: {
                  data: Buffer.from("oldImageData"),
                  contentType: "image/jpeg",
                },
            });
            
            const testImagePath = path.join(process.cwd(), "new-image.jpg");
            fs.writeFileSync(testImagePath, "new image");

            const res = await request(app)
              .put(`/api/v1/product/update-product/${testProduct._id}`)
              .field("description", "Updated description")
              .field("price", "120")
              .field("category", testCategory._id.toString())
              .field("quantity", "50")
              .field("shipping", "true")
              .attach("photo", testImagePath);
        
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("error", "Name is Required");
        });

        
        

        test("should return 500 if a database error occurs during update", async () => {
            let testProduct = await productModel.create({
                name: "Old Product",
                description: "Old description",
                price: 100,
                category: testCategory._id.toString(),
                quantity: 50,
                shipping: false,
                slug: "old-product",
                photo: {
                  data: Buffer.from("oldImageData"),
                  contentType: "image/jpeg",
                },
            });

            const originalFindByIdAndUpdate = productModel.findByIdAndUpdate;
            productModel.findByIdAndUpdate = jest.fn(() => {
              throw new Error("Database Error");
            });
        
            const testImagePath = path.join(process.cwd(), "update-image.jpg");
            fs.writeFileSync(testImagePath, "new image");

            const res = await request(app)
            .put(`/api/v1/product/update-product/${testProduct._id}`)
            .field("name", "Updated Product")
            .field("description", "Updated description")
            .field("price", "120")
            .field("category", testCategory._id.toString())
            .field("quantity", "50")
            .field("shipping", "true")
            .attach("photo", testImagePath);

            fs.unlinkSync(testImagePath);
        
            expect(res.status).toBe(500);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error in Update Product");
        
            productModel.findByIdAndUpdate = originalFindByIdAndUpdate;
        });
    });


    describe("productCountController", () => {
        test("should return total count equal to number of products in the database", async () => {
            await productModel.create(mockProducts);
        
            const res = await request(app).get("/api/v1/product/product-count");
        
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("total", 3);
        });

          test("should return total count 0 when no products exist", async () => {
            const res = await request(app).get("/api/v1/product/product-count");
        
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("success", true);
            expect(res.body).toHaveProperty("total", 0);
        });

        test("should return 400 if a database error occurs", async () => {
            const originalMethod = productModel.estimatedDocumentCount;
            productModel.estimatedDocumentCount = jest.fn(() => {
              throw new Error("Database Error");
            });
        
            const res = await request(app).get("/api/v1/product/product-count");
        
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("success", false);
            expect(res.body).toHaveProperty("message", "Error in product count");
        
            productModel.estimatedDocumentCount = originalMethod;
        });
    });


        
   

});