import bcrypt from "bcrypt";
import { comparePassword, hashPassword } from "./authHelper";

jest.mock("bcrypt");

describe("Hash Password Test", () => {
    let password;
    beforeEach(() => {
        jest.clearAllMocks();
        password = "password123"
    });

    it("should return hashed password", async () => {
        // Arrange
        bcrypt.hash = jest.fn().mockResolvedValue("hashPassword");

        // Act
        const result = await hashPassword(password);

        // Assert
        expect(result).toBe("hashPassword");
        expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    });

    it("should return an error", async () => {
        // Arrange
        const mockError = new Error("mock error");
        bcrypt.hash.mockRejectedValue(mockError);
        console.log = jest.fn();

        // Act
        await hashPassword(password);

        // Assert
        expect(console.log).toHaveBeenCalledWith(mockError);
    });
});

describe("Compare Password Test", () => {
    let password, hashedPassword;
    beforeEach(() => {
        jest.clearAllMocks();
        password = "password123"
        hashedPassword = "hashedPassword"
    });

    it("should return true for matching passwords", async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(true);

        // Act
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        expect(result).toBe(true);
    });

    it("should return false for non-matching passwords", async () => {
        // Arrange
        bcrypt.compare.mockResolvedValue(false);

        // Act
        const result = await comparePassword(password, hashedPassword);

        // Assert
        expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
        expect(result).toBe(false);
    });
})