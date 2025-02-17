import { afterAll, jest } from '@jest/globals'
import mongoose from "mongoose";

describe("Mongoose Database", () => {
    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        // Disconnect the DB connection allows Jest to exit successfully.
        await mongoose.disconnect();
    });

    test("if it connects to the database", async () => {
        const spy = jest.spyOn(mongoose, "connect");
        const isConnecting = await mongoose.connect(process.env.MONGO_URL);

        expect(spy).toHaveBeenCalled();
        expect(isConnecting).not.toBeNull();

        expect(mongoose.connection.readyState).toBe(1);
    });
});