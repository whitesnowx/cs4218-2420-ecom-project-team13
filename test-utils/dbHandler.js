const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongoServer = new MongoMemoryServer;

/**
 * Connect to the in=memory database
 */
export const dbConnect = async () => {
    const uri = await mongoServer.getUri();

    const mongooseOpts = {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    };

    await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongodb
 */
export const dbDisconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
};

/**
 * Remove all the data for all db collections
 */
export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany();
    };
};