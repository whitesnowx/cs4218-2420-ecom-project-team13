import { loginController, registerController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";

jest.mock("../models/userModel");
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
  role: "user"
};

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
    expect(res.send).toHaveBeenCalledWith({ error: "Name is Required" });
  });

  it("should return an error if email is missing", async () => {
    // Arrange
    req.body.email = "";

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ message: "Email is Required" });
  });

  it("should return an error if password is missing", async () => {
    // Arrange
    req.body.password = "";

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ message: "Password is Required" });
  });

  it("should return an error if phone is missing", async () => {
    // Arrange
    req.body.phone = "";

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ message: "Phone no is Required" });
  });

  it("should return an error if address is missing", async () => {
    // Arrange
    req.body.address = "";

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ message: "Address is Required" });
  });

  it("should return an error if answer is missing", async () => {
    // Arrange
    req.body.answer = "";

    // Act
    await registerController(req, res);

    // Assert
    expect(res.send).toHaveBeenCalledWith({ message: "Answer is Required" });
  });

  it("should return an error if user already exists", async () => {
    // Arrange
    userModel.findOne = jest.fn().mockResolvedValue(validUser);

    // Act
    await registerController(req, res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: false,
      message: "Already Register please login",
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

    // Act
    await registerController(req, res);

    // Assert
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
    expect(res.status).toHaveBeenCalledWith(404);
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
    expect(res.status).toHaveBeenCalledWith(404);
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
    expect(res.status).toHaveBeenCalledWith(200);
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