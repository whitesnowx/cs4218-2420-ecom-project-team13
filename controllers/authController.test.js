import {
  forgotPasswordController,
  getAllOrdersController,
  getOrdersController,
  loginController,
  orderStatusController,
  registerController,
  testController,
  updateProfileController
} from "./authController";
import userModel from "../models/userModel";
import orderModel from "../models/orderModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel");
jest.mock("../models/orderModel");
jest.mock("../helpers/authHelper");
jest.mock("jsonwebtoken");

const validUser = {
  _id: "123",
  name: "John Doe",
  email: "johndoe@example.com",
  password: "johndoe123",
  phone: "98765432",
  address: "123 Main Street",
  answer: "answer",
  role: 1
};

describe("Auth Controller", () => {
  describe("Register Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          name: validUser.name,
          email: validUser.email,
          password: validUser.password,
          phone: validUser.phone,
          address: validUser.address,
          answer: validUser.answer
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });

    it("should return an error if name is missing", async () => {
      // Arrange
      req.body.name = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Name is required" });
    });

    it("should return an error if email is missing", async () => {
      // Arrange
      req.body.email = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
    });

    it("should return an error if password is missing", async () => {
      // Arrange
      req.body.password = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Password is required" });
    });

    it("should return an error if phone is missing", async () => {
      // Arrange
      req.body.phone = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Phone no is required" });
    });

    it("should return an error if address is missing", async () => {
      // Arrange
      req.body.address = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Address is required" });
    });

    it("should return an error if answer is missing", async () => {
      // Arrange
      req.body.answer = "";

      // Act
      await registerController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
    });

    it("should return an error if user already exists", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(validUser);

      // Act
      await registerController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Already registered. Please login",
      });
    });

    it("should register user successfully", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);
      hashPassword.mockResolvedValue(validUser.password);
      userModel.prototype.save = jest.fn().mockResolvedValue(validUser);

      // Act
      await registerController(req, res);

      // Assert
      expect(userModel.prototype.save).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "User Register Successfully",
        user: expect.objectContaining(validUser),
      });
    });

    it("should return an error", async () => {
      // Arrange 
      const mockError = new Error("mock error");
      userModel.findOne = jest.fn().mockRejectedValue(mockError);
      console.log = jest.fn();

      // Act
      await registerController(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in Registeration",
        error: mockError
      });
    });
  });

  describe("Login Controller Test", () => {
    let req, res

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          email: validUser.email,
          password: validUser.password,
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });

    it("should return error if email is missing", async () => {
      // Arrange
      req.body.email = "";

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password"
      });
    });

    it("should return error if password is missing", async () => {
      // Arrange
      req.body.password = "";

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid email or password"
      });
    });

    it("should return error if user does not exist", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Email is not registered"
      });
    });

    it("should return an error if password is incorrect", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(validUser);
      comparePassword.mockResolvedValue(false);

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Invalid Password"
      });
    });

    it("should login user successfully", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(validUser);
      comparePassword.mockResolvedValue(true);
      JWT.sign = jest.fn().mockResolvedValue("mock token");

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "login successfully",
        user: {
          _id: validUser._id,
          name: validUser.name,
          email: validUser.email,
          phone: validUser.phone,
          address: validUser.address,
          role: validUser.role,
        },
        token: "mock token"
      });
    });

    it("should return an error", async () => {
      // Arrange 
      const mockError = new Error("mock error");
      userModel.findOne = jest.fn().mockRejectedValue(mockError);
      console.log = jest.fn();

      // Act
      await loginController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error in login",
        error: mockError
      });
    });
  });

  describe("Forgot Password Controller Test", () => {
    let req, res

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          email: validUser.email,
          answer: validUser.answer,
          newPassword: "Password123"
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });

    it("should return an error if email is missing", async () => {
      // Arrange
      req.body.email = "";

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Email is required" });
    });

    it("should return an error if answer is missing", async () => {
      // Arrange
      req.body.answer = "";

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "Answer is required" });
    });

    it("should return an error if new password is missing", async () => {
      // Arrange
      req.body.newPassword = "";

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({ message: "New Password is required" });
    });

    it("should return error if user does not exist", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(null);

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Wrong Email Or Answer"
      });
    });

    it("should reset password successfully", async () => {
      // Arrange
      userModel.findOne = jest.fn().mockResolvedValue(validUser);
      hashPassword.mockResolvedValue("Password123");
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(true);

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Password Reset Successfully"
      });
    });

    it("should return an error", async () => {
      // Arrange
      const mockError = new Error("mock error");
      userModel.findOne = jest.fn().mockRejectedValue(mockError);
      console.log = jest.fn();

      // Act
      await forgotPasswordController(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Something went wrong",
        error: mockError
      });
    });
  });

  describe("Test Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {};
      res = {
        send: jest.fn()
      };
    });

    it("should return Protected Routes", async () => {
      // Arrange
      // Act
      await testController(req, res);

      // Assert
      expect(res.send).toHaveBeenCalledWith("Protected Routes");
    });

    it("should return an error", async () => {
      // Arrange
      const mockError = new Error("mock error");
      console.log = jest.fn(); // Mock console.log to prevent actual logging
      res.send.mockImplementationOnce(() => {
        throw mockError;
      });

      // Act
      await testController(req, res);

      // Assert
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.send).toHaveBeenCalledWith({ error: mockError });
    });
  });

  describe("Update Profile Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          name: validUser.name,
          email: validUser.email,
          password: validUser.password,
          address: validUser.address,
          phone: validUser.phone
        },
        user: {
          _id: validUser._id
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn()
      };
    });

    it("should return an error if password's length is less than 6", async () => {
      // Arrange
      req.body.password = "apple";
      userModel.findById = jest.fn().mockResolvedValue(validUser);

      // Act
      await updateProfileController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        error: "Password is required and 6 character long"
      });
    });

    it("should successfully update profile", async () => {
      // Arrange
      userModel.findById = jest.fn().mockResolvedValue(validUser);
      hashedPassword = jest.fn().mockResolvedValue("newpassword");

      let updatedUser = validUser;
      updatedUser.password = "newpassword";
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      // Act
      await updateProfileController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Profile Updated Successfully",
        updatedUser: updatedUser
      });
    });

    it("should successfully update profile if all input missing", async () => {
      // Arrange
      req.body.name = "";
      req.body.password = "";
      req.body.address = "";
      req.body.phone = "";

      userModel.findById = jest.fn().mockResolvedValue(validUser);

      let updatedUser = validUser;
      userModel.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedUser);

      // Act
      await updateProfileController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        success: true,
        message: "Profile Updated Successfully",
        updatedUser: updatedUser
      });
    });

    it("should return an error", async () => {
      // Arrange
      const mockError = new Error("mock error");
      userModel.findById = jest.fn().mockRejectedValue(mockError);

      // Act
      await updateProfileController(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while updating profile",
        error: mockError
      });
    });
  });

  describe("Get Orders Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
      };
    });

    it("should successfully return orders", async () => {
      // Arrange
      req = {
        user: {
          _id: validUser._id
        }
      };

      const mockOrders = {
        "_id": {
          "$oid": "67a21938cf4efddf1e5358d1"
        },
        "products": [
          {
            "$oid": "67a21772a6d9e00ef2ac022a"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          }
        ],
        "payment": {},
        "buyer": {},
        "status": "Not Process",
        "createdAt": {},
        "updatedAt": {},
        "__v": 0
      }

      const mockPopulate = jest.fn().mockReturnValueOnce(mockOrders);

      orderModel.find = jest.fn().mockReturnValue({
        populate: mockPopulate
      });

      // Act
      await getOrdersController(req, res);

      // Assert
      expect(orderModel.find).toHaveBeenCalledWith({ buyer: validUser._id });
      expect(mockPopulate).toHaveBeenCalledWith([
        { path: "products", select: "-photo" },
        { path: "buyer", select: "name" }
      ]);
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("should return an error", async () => {
      // Arrange
      req = {
        user: {
          _id: validUser._id
        }
      };
      console.log = jest.fn();

      const mockError = new Error("mock error");

      const mockPopulate = jest.fn().mockRejectedValue(mockError);
      orderModel.find = jest.fn().mockReturnValue({
        populate: mockPopulate,
      });

      // Act
      await getOrdersController(req, res);

      // Assert
      expect(orderModel.find).toHaveBeenCalledWith({ buyer: validUser._id });
      expect(mockPopulate).toHaveBeenCalledWith([
        { path: "products", select: "-photo" },
        { path: "buyer", select: "name" }
      ]);
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting orders",
        error: mockError
      });
    });
  });

  describe("Get All Orders Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
      };
    });

    it("should successfully return all orders", async () => {
      // Arrange
      req = {
        user: {
          _id: validUser._id
        }
      };

      const mockOrders = {
        "_id": {
          "$oid": "67a21938cf4efddf1e5358d1"
        },
        "products": [
          {
            "$oid": "67a21772a6d9e00ef2ac022a"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          }
        ],
        "payment": {},
        "buyer": {},
        "status": "Not Process",
        "createdAt": {},
        "updatedAt": {},
        "__v": 0
      };

      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockReturnValue(mockOrders);

      orderModel.find = jest.fn().mockReturnValue({
        populate: mockPopulate,
        sort: mockSort
      });

      // Act
      await getAllOrdersController(req, res);

      // Assert
      expect(orderModel.find).toHaveBeenCalledWith({});
      expect(mockPopulate).toHaveBeenCalledWith([
        { path: "products", select: "-photo" },
        { path: "buyer", select: "name" }
      ]);
      expect(mockSort).toHaveBeenCalledWith({
        createdAt: -1
      });
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("should return an error", async () => {
      // Arrange
      req = {
        user: {
          _id: validUser._id
        }
      };
      console.log = jest.fn();

      const mockError = new Error("mock error");

      const mockPopulate = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockRejectedValue(mockError);
      orderModel.find = jest.fn().mockReturnValue({
        populate: mockPopulate,
        sort: mockSort
      });

      // Act
      await getAllOrdersController(req, res);

      // Assert
      expect(orderModel.find).toHaveBeenCalledWith({});
      expect(mockPopulate).toHaveBeenCalledWith([
        { path: "products", select: "-photo" },
        { path: "buyer", select: "name" }
      ]);
      expect(mockSort).toHaveBeenCalledWith({
        createdAt: -1
      });
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while getting all orders",
        error: mockError
      });
    });
  });

  describe("Order Status Controller Test", () => {
    let req, res;

    beforeEach(() => {
      jest.clearAllMocks();
      req = {
        body: {
          status: "Processing"
        },
        params: {
          orderId: 123
        }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
        json: jest.fn()
      };
    });

    it("should successfully update order status", async () => {
      // Arrange
      const mockOrders = {
        "_id": {
          "$oid": "67a21938cf4efddf1e5358d1"
        },
        "products": [
          {
            "$oid": "67a21772a6d9e00ef2ac022a"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          },
          {
            "$oid": "66db427fdb0119d9234b27f3"
          }
        ],
        "payment": {},
        "buyer": {},
        "status": "Processing",
        "createdAt": {},
        "updatedAt": {},
        "__v": 0
      }

      orderModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrders);

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.orderId,
        { status: req.body.status },
        { new: true }
      );
      expect(res.json).toHaveBeenCalledWith(mockOrders);
    });

    it("should return an error", async () => {
      // Arrange
      console.log = jest.fn();
      const mockError = new Error("mock error");

      orderModel.findByIdAndUpdate = jest.fn().mockRejectedValue(mockError);

      // Act
      await orderStatusController(req, res);

      // Assert
      expect(orderModel.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.orderId,
        { status: req.body.status },
        { new: true }
      );
      expect(console.log).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        success: false,
        message: "Error while updating order status",
        error: mockError
      });
    });
  });
});

