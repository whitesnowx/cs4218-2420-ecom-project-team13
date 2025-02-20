import bcrypt from "bcrypt";
import { hashPassword } from "./authHelper";

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