import JWT from "jsonwebtoken";
import userModel from "../models/userModel";
import { isAdmin, requireSignIn } from "./authMiddleware";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel");

describe("Require Sign In Test", () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            headers: {
                authorization: ""
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    it("should call next() if token is valid", async () => {
        // Arrange
        JWT.verify = jest.fn().mockReturnValue("decoded token");

        // Act
        await requireSignIn(req, res, next);

        // Assert
        expect(JWT.verify).toHaveBeenCalledWith(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
        expect(req.user).toBe("decoded token");
        expect(next).toHaveBeenCalled();
    });

    it("should return an error", async () => {
        // Arrange
        const mockError = new Error("mock error");
        JWT.verify.mockImplementationOnce(() => {
            throw mockError;
        });
        console.log = jest.fn();

        // Act
        await requireSignIn(req, res, next);

        // Assert
        expect(JWT.verify).toHaveBeenCalledWith(
            req.headers.authorization,
            process.env.JWT_SECRET
        );
        expect(next).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(mockError);
    });
});

describe("Is Admin Test", () => {
    let req, res, next;
    const user = {
        _id: "123",
        role: 0
    }

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: {
                _id: user._id
            }
        }
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn()
        };
        next = jest.fn();
    });

    it("should return an error if user role is not 1", async () => {
        // Arrange
        userModel.findById = jest.fn().mockResolvedValue(user);

        // Act
        await isAdmin(req, res, next);

        // Assert
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Unauthorized Access"
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next() if user role is 1", async () => {
        // Arrange
        user.role = 1;
        userModel.findById = jest.fn().mockResolvedValue(user);

        // Act
        await isAdmin(req, res, next);

        // Assert
        expect(next).toHaveBeenCalled();
    });

    it("should return an error", async () => {
        // Arrange
        const mockError = new Error("mock error");
        userModel.findById = jest.fn().mockRejectedValue(mockError);
        console.log = jest.fn();

        // Act
        await isAdmin(req, res, next);

        // Assert
        expect(next).not.toHaveBeenCalled();
        expect(console.log).toHaveBeenCalledWith(mockError);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            error: mockError,
            message: "Error in admin middleware"
        });
    });
});