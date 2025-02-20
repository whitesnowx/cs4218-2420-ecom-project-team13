import JWT from "jsonwebtoken";
import userModel from "../models/userModel";
import { requireSignIn } from "./authMiddleware";

jest.mock("jsonwebtoken");
jest.mock("../models/userModel");

describe("Require Sign In Test", () => {
    let req, res, next;

    beforeEach(() => {
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