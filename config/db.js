import mongoose from "mongoose";
import colors from "colors";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer

export const connectDB = async () => {
    try {
        let conn;

        if (process.env.DEV_MODE === "development") {
            // Connect to the actual MongoDB
            conn = await mongoose.connect(process.env.MONGO_URL);
        } else if (process.env.DEV_MODE === "test") {
            // Connect to the in-memory database
            mongoServer = await MongoMemoryServer.create({
                instance: {
                    port: 27017,
                    dbName: "ecommerce-test"
                }
            });
            const uri = await mongoServer.getUri();

            const mongooseOpts = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            };

            conn = await mongoose.connect(uri, mongooseOpts);
        } else {
            throw new Error("Invalid DEV_MODE");            
        }
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export const disconnectDB = async () => {
    try {
        if (process.env.DEV_MODE === "development") {
            await mongoose.disconnect();
        } else if (process.env.DEV_MODE === "test") {
            // Drop database, close the connection and stop mongodb
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            await mongoServer.stop();
        } else {
            throw new Error("Invalid DEV_MODE");
        }
        console.log("Disconnected from Mongodb Database".bgMagenta.white);
    } catch (error) {
        console.log(`Error in disconnecting Mongodb ${error}`.bgRed.white);
    }
}