import { createProductController, deleteProductController, getProductController, getSingleProductController, productCategoryController, productCountController, productFiltersController, productListController, productPhotoController, realtedProductController, searchProductController, updateProductController } from "./productController";
import productModel from "../models/productModel";
import slugify from "slugify";
import fs from "fs";
import { populate } from "dotenv";
import categoryModel from "../models/categoryModel";

jest.mock("../models/productModel");
jest.mock("../models/categoryModel");
jest.mock("slugify");
jest.mock("fs", () => ({ readFileSync: jest.fn() }));

const validProduct = {
  _id: "123",
  name: "Calculator",
  description: "A powerful calculator",
  price: 30,
  category: "Electronics",
  quantity: 200,
  shipping: true,
  slug: "calculator",
  photo: {
    data: Buffer.from("mockImageData"),
    contentType: "image/jpeg",
  },
};

const photoTemplate = {
  data: Buffer.from('mockImageData'),
  contentType: "image/jpeg"
};

const mockProducts = [{
  _id: "1", 
  name: "Product1", 
  slug: "product1", 
  description: "Product1's description", 
  price: 20, 
  category: "Books", 
  quantity: 200, 
  shipping: true, 
  photo: { ...photoTemplate }
},
{
  _id: "2", 
  name: "Product2", 
  slug: "product2", 
  description: "Product2's description", 
  price: 30.50, 
  category: "Category2", 
  quantity: 300, 
  shipping: true, 
  photo: { ...photoTemplate}
},
{
  _id: "3", 
  name: "Product3", 
  slug: "product3", 
  description: "Product3's description", 
  price: 15, 
  category: "Electronics", 
  quantity: 400, 
  shipping: true, 
  photo: { ...photoTemplate}
}];

const mockError = new Error("Database Error");


jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "log").mockImplementation(() => {});

describe("Create Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();


    req = {
      fields: {
        name: validProduct.name,
        description: validProduct.description,
        price: validProduct.price,
        category: validProduct.category,
        quantity: validProduct.quantity,
        shipping: validProduct.shipping,
      },
      files: {
        photo: {
          path: "/test/path/photo.jpeg",
          type: "image/jpeg",
          size: 2048,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    fs.readFileSync.mockReturnValue(validProduct.photo.data);

    
  });

  test("should create a product successfully", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    await createProductController(req, res);
  
    // Verify fs.readFileSync is called for reading the image
    expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);

    // Expect correct response (fixing the structure mismatch)
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Created Successfully",
        products: expect.objectContaining({
          _id: validProduct._id,
          name: validProduct.name,
          description: validProduct.description,
          price: validProduct.price,
          category: validProduct.category,
          quantity: validProduct.quantity,
          shipping: validProduct.shipping,
          slug: validProduct.slug,
          photo: expect.any(Object), 
        }),
      })
    );
  });


  test("should return error when field name is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.name = "";

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Name is Required",
      })
    );
  });


  test("should return error when field description is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.description = "";

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Description is Required",
      })
    );
  });

  test("should return error when field price is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.price = "";

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Price is Required",
      })
    );
  });


  test("should return error when field category is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.category = "";

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Category is Required",
      })
    );
  });


  test("should return error when field quantity is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.quantity = "";

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Quantity is Required",
      })
    );
  });

  test("should return error when photo size exceeds 1MB", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockResolvedValue(validProduct),
    }));

    req.files.photo = {
      path: "/test/path/photo.jpeg",
      type: "image/jpeg",
      size: 1000001,
    };

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
  });


  
  test("should return 500 when an error occurs", async () => {

    const mockError = new Error("Database Error");
    productModel.mockImplementation(() => ({
      ...validProduct,
      save: jest.fn().mockRejectedValue(mockError),
    }));

    await createProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error in crearing product",
    });
  });


  
});



describe("Get Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

  });

  test("should return all products successfully", async () => {
    
    productModel.find.mockImplementation(() => ({
      populate: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    }));

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.send).toHaveBeenCalledWith({
      success: true,
      counTotal: mockProducts.length,
      message: "ALlProducts ",
      products: mockProducts,
    });

  });


  test("should return 500 when an error occurs", async () => {
    
    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    await getProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr in getting products",
      error: mockError.message,
    });

  });

});


describe("Get Single Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { slug: validProduct.slug},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

  });

  test("should return all products successfully", async () => {
    
    productModel.findOne.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(validProduct),
    }));

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Single Product Fetched",
      product: validProduct,
    });

  });

  test("should return 500 when an error occurs", async () => {
    
    productModel.findOne.mockImplementation(() => {
      throw mockError;
    });

    await getSingleProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Eror while getitng single product",
      error: mockError,
    });

  });

});



describe("Product Photo Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { pid: "123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      set: jest.fn(),
    };
  });


  test("should return product photo successfully", async () => {

    productModel.findById.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        id: validProduct.pid,
        photo: {
          data: validProduct.photo.data,
          contentType: validProduct.photo.contentType,
        },
      }),
    }));

    await productPhotoController(req, res);

    expect(res.set).toHaveBeenCalledWith("Content-type", validProduct.photo.contentType);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.send).toHaveBeenCalledWith(validProduct.photo.data);

  });


  test("should return 500 when an error occurs", async () => {
    productModel.findById.mockImplementation(() => {
      throw mockError;
    });

    await productPhotoController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Erorr while getting photo",
      error: mockError,
    });
  });

});



describe("Delete Product Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { pid: "123"},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should delete a product successfully", async () => {
    
    productModel.findByIdAndDelete.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue({
        id: validProduct.pid,
        photo: {
          data: validProduct.photo.data,
          contentType: validProduct.photo.contentType,
        },
      }),
    }));

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.send).toHaveBeenCalledWith({
      success: true,
      message: "Product Deleted successfully",
    });

  });

  test("should return 500 when an error occurs", async () => {
    productModel.findByIdAndDelete.mockImplementation(() => {
      throw mockError;
    });

    await deleteProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error while deleting product",
      error: mockError,
    });
  });

});



describe("Update Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { pid: validProduct._id},
      fields: {
        name: validProduct.name,
        description: validProduct.description,
        price: validProduct.price,
        category: validProduct.category,
        quantity: validProduct.quantity,
        shipping: validProduct.shipping,
      },
      files: {
        photo: {
          path: "/test/path/photo.jpeg",
          type: "image/jpeg",
          size: 2048,
        },
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    fs.readFileSync.mockReturnValue(validProduct.photo.data);

    
  });

  test("should update a product successfully", async () => {

    productModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
      ...validProduct,
      photo: {
        data: Buffer.from("mockImageData"),
        contentType: "image/jpeg",
      },
    });

    await updateProductController(req, res);

    expect(fs.readFileSync).toHaveBeenCalledWith(req.files.photo.path);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        message: "Product Updated Successfully",
        products: expect.objectContaining({
          _id: validProduct._id,
          name: validProduct.name,
          description: validProduct.description,
          price: validProduct.price,
          category: validProduct.category,
          quantity: validProduct.quantity,
          shipping: validProduct.shipping,
          slug: validProduct.slug,
          photo: expect.any(Object), 
        }),
      })
    );
  });


  test("should return error when field name is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.name = "";

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Name is Required",
      })
    );
  });


  test("should return error when field description is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.description = "";

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Description is Required",
      })
    );
  });

  test("should return error when field price is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.price = "";

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Price is Required",
      })
    );
  });


  test("should return error when field category is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.category = "";

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Category is Required",
      })
    );
  });


  test("should return error when field quantity is missing", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.fields.quantity = "";

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Quantity is Required",
      })
    );
  });

  test("should return error when photo size exceeds 1MB", async () => {

    productModel.mockImplementation(() => ({
      ...validProduct,
      findByIdAndUpdate: jest.fn().mockResolvedValue(validProduct),
    }));

    req.files.photo = {
      path: "/test/path/photo.jpeg",
      type: "image/jpeg",
      size: 1000001,
    };

    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
        error: "photo is Required and should be less then 1mb",
      });
  });

  
  test("should return 500 when an error occurs", async () => {

    const mockError = new Error("Database Error");
    
    productModel.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);
    
    await updateProductController(req, res);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error in Updte product",
    });
  });

});


describe(" Product Filters Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {
        checked: ["Electronics", "Books"],
        radio: [10, 50],
      }
    }

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });


  test("should return filtered products successfully", async () => {
    const filteredProducts = [{
      _id: "1", 
      name: "Product1", 
      slug: "product1", 
      description: "Product1's description", 
      price: 20, 
      category: "Books", 
      quantity: 200, 
      shipping: true, 
      photo: { ...photoTemplate }
    },
    {
      _id: "3", 
      name: "Product3", 
      slug: "product3", 
      description: "Product3's description", 
      price: 15, 
      category: "Electronics", 
      quantity: 400, 
      shipping: true, 
      photo: { ...photoTemplate}
    }];
  
    productModel.find.mockImplementation((query) => {
      return Promise.resolve(mockProducts.filter((product) => {
        const categoryMatch = query.category ? query.category.includes(product.category) : true;
        const priceMatch = query.price ? (product.price >= query.price.$gte && product.price <= query.price.$lte) : true;
        return categoryMatch && priceMatch;
      }));
    });
  
    await productFiltersController(req, res);
  
    expect(productModel.find).toHaveBeenCalledWith({
      category: ["Electronics", "Books"],
      price: { $gte: 10, $lte: 50 },
    });
  
    expect(res.status).toHaveBeenCalledWith(200);
    
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: filteredProducts,
    });
  
    // Ensure that Product2 (wrong category) is not in the response
    expect(res.send).not.toHaveBeenCalledWith(
      expect.objectContaining({
        products: expect.arrayContaining([
          expect.objectContaining({ category: "Category2" }),
        ]),
      })
    );
  });

  test("should return all products when no filters are applied", async () => {
    req.body = {checked: [], radio: []}; 

    productModel.find.mockResolvedValue(mockProducts);
    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
        success: true,
        products: mockProducts,
    });
  });
  

  test("should return 400 when an error occurs", async () => {
    productModel.find.mockRejectedValue(mockError);

    await productFiltersController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Error WHile Filtering Products",
      error: mockError,
    });
  });

});


describe("Product Count Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {};

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return product count successfully", async () => {
    const mockCount = 10;

    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockResolvedValue(mockCount),
    });

    await productCountController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      total: mockCount,
    });
  });


  test("should return 400 when an error occurs", async () => {
  
    productModel.find.mockReturnValue({
      estimatedDocumentCount: jest.fn().mockRejectedValue(mockError),
    });

    await productCountController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "Error in product count",
      error: mockError,
      success: false,
    });
  });

});



describe("Product List Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { page: "3"}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

  });


  test("should return product list successfully", async () => {
    productModel.find.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockProducts),
    }));

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });

  });

  test("should return page 1 when no page param", async () => {
    req.params = {};

    const mockSingleProduct = [{
      _id: "1", 
      name: "Product1", 
      slug: "product1", 
      description: "Product1's description", 
      price: 20, 
      category: "Books", 
      quantity: 200, 
      shipping: true, 
      photo: { ...photoTemplate }
    },];

    productModel.find.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue(mockSingleProduct),
    }));

    await productListController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockSingleProduct,
    });

  });


  test("should return 400 when an error occurs", async () => {

    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    await productListController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "error in per page ctrl",
      error: mockError,
    });
  });

});

describe("Search Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { 
      params: { keyword: "calculator"},
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return searched products successfully", async () => {
    productModel.find.mockImplementation(() => ({
      select: jest.fn().mockResolvedValue([mockProducts[0]]),
    }));

    await searchProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      $or: [
        { name: { $regex: req.params.keyword, $options: "i"}},
        { description: {$regex: req.params.keyword, $options: "i"}},
      ],
    });

    expect(res.json).toHaveBeenCalledWith([mockProducts[0]]);

  });

  test("should return 400 when an error occurs", async () => {
    productModel.find.mockImplementation(() => {
      throw mockError;
    });

    await searchProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false, 
      message: "Error In Search Product API",
      error: mockError,
    });
  });

});


describe("Related Product Controller Test", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {pid: "1", cid: "Electronics"}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  test("should return related products successfully", async () => {
    productModel.find.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue(mockProducts),
    }));

    await realtedProductController(req, res);

    expect(productModel.find).toHaveBeenCalledWith({
      _id: { $ne: req.params.pid},
      category: req.params.cid,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      products: mockProducts,
    });

  });

  test("should return an empty array if no related products available", async () => {
    productModel.find.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockResolvedValue([]),
    }));

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true, 
      products: [],
    });

  });

  test("should return error when an error occurs", async () => {
    productModel.find.mockImplementation(() => {
      throw mockError
    });

    await realtedProductController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false, 
      message: "error while geting related product",
      error: mockError,
    });

  });

});

describe("Product Category Controller Test", () => {
  let req, res, mockCategoryPC, mockProductPC;

  mockCategoryPC = {
    _id: "c1", name: "Electronics", slug: "electronics"
  };

  mockProductPC = [{
    id: "1", 
    name: "Calculator", 
    slug: "calculator", 
    description: "Calculator's description", 
    price: 20, 
    category: "Electronics", 
    quantity: 200, 
    shipping: true, 
    photo: { ...photoTemplate }
   }, {
    id: "2", 
    name: "Laptop", 
    slug: "laptop", 
    description: "Laptop's description", 
    price: 2000, 
    category: "Electronics", 
    quantity: 100, 
    shipping: true, 
    photo: { ...photoTemplate }
  }]

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: { slug: "electronics"}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

  });

  test("should return products based on the category successfully", async () => {
    categoryModel.findOne.mockResolvedValue(mockCategoryPC);
    productModel.find.mockImplementation(() => ({
      populate: jest.fn().mockResolvedValue(mockProductPC),
    }));

    await productCategoryController(req, res);

    expect(categoryModel.findOne).toHaveBeenCalledWith({ slug: req.params.slug});
    expect(productModel.find).toHaveBeenCalledWith({ category: mockCategoryPC});
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      category: mockCategoryPC,
      products: mockProductPC,
    });
  });


  test("should return 400 when categoryModel throws error", async () => {
    categoryModel.findOne.mockImplementation(() => {
      throw mockError
    });

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error While Getting products",
    });
  });

  test("should return 400 when productModel throws error", async () => {
    categoryModel.findOne.mockResolvedValue(mockCategoryPC);
    productModel.find.mockImplementation(() => {
      throw mockError
    });

    await productCategoryController(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      error: mockError,
      message: "Error While Getting products",
    });
  });

});

