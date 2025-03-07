import mongoose from "mongoose";
import connectDB from "./db";

jest.mock("mongoose");

describe("Mongoose Database", () => {
    const mockMongoDbUrl = "mongodb://localhost:27017/test";

    beforeAll(() => {
        console.log = jest.fn();
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("if it connects to the database", async () => {
        // Arrange
        const mockConn = {
            connection: {
                host: "localhost"
            }
        };
        process.env.MONGO_URL = mockMongoDbUrl;
        mongoose.connect = jest.fn().mockResolvedValue(mockConn);

        // Act
        await connectDB();

        // Assert
        expect(mongoose.connect).toHaveBeenCalledWith(mockMongoDbUrl);
        expect(console.log).toHaveBeenCalledWith(`Connected To Mongodb Database ${mockConn.connection.host}`.bgMagenta.white);
    });

    test("should return an error if db url is missing", async () => {
        // Arrange 
        const mockError = new Error("Connection failed");
        mongoose.connect = jest.fn().mockRejectedValue(mockError);

        // Act
        await connectDB();

        // Assert
        expect(mongoose.connect).toHaveBeenCalledWith(mockMongoDbUrl);
        expect(console.log).toHaveBeenCalledWith(`Error in Mongodb ${mockError}`.bgRed.white);
    });

});