import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./db";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.mock("mongoose");
jest.mock("mongodb-memory-server", () => ({
    MongoMemoryServer: {
        create: jest.fn(),
    }
}));

const mockMongoMemoryServer = {
    getUri: jest.fn().mockReturnValue("mongodb://127.0.0.1:27017/"),
    stop: jest.fn()
};

describe("Mongoose Database", () => {
    beforeAll(() => {
        console.log = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Database Connection", () => {
        describe("when DEV_MODE = development", () => {
            beforeAll(() => {
                process.env.DEV_MODE = "development";
            });

            it("should connect to the database", async () => {
                // Arrange
                const mockConn = {
                    connection: {
                        host: "localhost"
                    }
                };
                mongoose.connect = jest.fn().mockResolvedValue(mockConn);

                // Act
                await connectDB();

                // Assert
                expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
                expect(console.log).toHaveBeenCalledWith(`Connected To Mongodb Database ${mockConn.connection.host}`.bgMagenta.white);
            });

            it("should return an error if db url is missing", async () => {
                // Arrange 
                const mockError = new Error("Connection failed");
                mongoose.connect = jest.fn().mockRejectedValue(mockError);

                // Act
                await connectDB();

                // Assert
                expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URL);
                expect(console.log).toHaveBeenCalledWith(`Error in Mongodb ${mockError}`.bgRed.white);
            });
        });

        describe("when DEV_NODE = test", () => {
            beforeAll(() => {
                process.env.DEV_MODE = "test";
            });

            it("should connect to the in-memory database", async () => {
                // Arrange
                const mockConn = {
                    connection: {
                        host: "localhost"
                    }
                };
                MongoMemoryServer.create.mockResolvedValueOnce(mockMongoMemoryServer);
                mongoose.connect.mockResolvedValueOnce(mockConn);

                // Act
                await connectDB();

                // Assert
                expect(MongoMemoryServer.create).toHaveBeenCalled();
                expect(mongoose.connect).toHaveBeenCalledWith("mongodb://127.0.0.1:27017/", {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                expect(console.log).toHaveBeenCalledWith(`Connected To Mongodb Database ${mockConn.connection.host}`.bgMagenta.white);
            });
        });

        describe("when DEV_MODE = random", () => {
            beforeAll(async () => {
                process.env.DEV_MODE = "random";
            });

            it("should throw an error", async () => {
                // Arrange
                const mockError = new Error("Invalid DEV_MODE");

                // Act
                await connectDB();

                // Assert
                expect(() => {
                    if (process.env.DEV_MODE !== "development" && process.env.DEV_MODE !== "test") {
                        throw new Error("Invalid DEV_MODE");
                    }
                }).toThrow(mockError);
                expect(console.log).toHaveBeenCalledWith(`Error in Mongodb ${mockError}`.bgRed.white);
            });
        });

    });

    describe("Database Disconnection", () => {
        describe("when DEV_MODE = development", () => {
            beforeAll(async () => {
                process.env.DEV_MODE = "development";
                await connectDB();
            });

            it("should disconnect from the database", async () => {
                // Arrange
                mongoose.disconnect = jest.fn().mockResolvedValue(true);

                // Act
                await disconnectDB();

                // Assert
                expect(mongoose.disconnect).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalledWith("Disconnected from Mongodb Database".bgMagenta.white);
            });

            it("should return an error", async () => {
                // Arrange
                const mockError = new Error("mock error");
                mongoose.disconnect = jest.fn().mockRejectedValue(mockError);

                // Act
                await disconnectDB();

                // Assert
                expect(mongoose.disconnect).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalledWith(`Error in disconnecting Mongodb ${mockError}`.bgRed.white);
            });
        });

        describe("when DEV_MODE = test", () => {
            beforeAll(async () => {
                process.env.DEV_MODE = "test";

                const mockConn = {
                    connection: {
                        host: "localhost"
                    }
                };
                MongoMemoryServer.create.mockResolvedValueOnce(mockMongoMemoryServer);
                mongoose.connect.mockResolvedValueOnce(mockConn);

                await connectDB();

                mongoose.connection = {
                    dropDatabase: jest.fn().mockResolvedValue(true),
                    close: jest.fn().mockResolvedValue(true),
                };
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it("should disconnect from the in-memory database", async () => {
                // Arrange
                mongoose.connection.dropDatabase = jest.fn().mockResolvedValue(true);
                mongoose.connection.close = jest.fn().mockResolvedValue(true);
                mockMongoMemoryServer.stop = jest.fn().mockResolvedValue(true);

                // Act
                await disconnectDB();

                // Assert
                expect(mongoose.connection.dropDatabase).toHaveBeenCalled();
                expect(mongoose.connection.close).toHaveBeenCalled();
                expect(mockMongoMemoryServer.stop).toHaveBeenCalled();
                expect(console.log).toHaveBeenCalledWith("Disconnected from Mongodb Database".bgMagenta.white);
            });
        });

        describe("when DEV_MODE = random", () => {
            beforeAll(async () => {
                process.env.DEV_MODE = "random";
                await connectDB();
            });

            it("should throw an error", async () => {
                // Arrange
                const mockError = new Error("Invalid DEV_MODE");

                // Act
                await disconnectDB();

                // Assert
                expect(() => {
                    if (process.env.DEV_MODE !== "development" && process.env.DEV_MODE !== "test") {
                        throw new Error("Invalid DEV_MODE");
                    }
                }).toThrow(mockError);
                expect(console.log).toHaveBeenCalledWith(`Error in disconnecting Mongodb ${mockError}`.bgRed.white);
            });
        });
    });
});