import { afterEach, beforeAll, expect, jest, test } from '@jest/globals'
import mongoose from "mongoose";
import connectDB from './db';

describe("Mongoose Database", () => {
    let mongooseConnectSpy, consoleLogSpy;

    beforeAll(() => {
        mongooseConnectSpy = jest.spyOn(mongoose, "connect");
        consoleLogSpy = jest.spyOn(console, "log");
    })

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("if it connects to the database", async () => {
        // Arrange 
        const mockConn = {
            connection: {
                host: process.env.MONGO_URL
            }
        };
        mongooseConnectSpy.mockResolvedValue(mockConn);

        // Act
        await connectDB();

        // Assert
        const dbURL = mongooseConnectSpy.mock.calls[0][0];
        expect(dbURL).toMatch(process.env.MONGO_URL);
        expect(mongooseConnectSpy).toHaveBeenCalledWith(dbURL);
        expect(consoleLogSpy).toHaveBeenCalledWith(`Connected To Mongodb Database ${process.env.MONGO_URL}`.bgMagenta.white);
    });

    test("should return an error if db url is missing", async () => {
        // Arrange 
        const mockError = new Error('Connection failed');
        mongooseConnectSpy.mockRejectedValue(mockError);

        // Act
        await connectDB();

        // Assert
        expect(mongooseConnectSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith(`Error in Mongodb ${mockError}`.bgRed.white);
    });

});