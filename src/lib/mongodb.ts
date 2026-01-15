import mongoose from "mongoose";
import { config } from "./config";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

export async function connectMongo() {
  const globalForMongoose = global as typeof globalThis & {
    mongooseCache?: MongooseCache;
  };

  if (!globalForMongoose.mongooseCache) {
    globalForMongoose.mongooseCache = { conn: null, promise: null };
  }

  const cache = globalForMongoose.mongooseCache;

  if (!config.mongodb.uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (cache?.conn) {
    return cache.conn;
  }

  if (!cache?.promise) {
    cache.promise = mongoose.connect(config.mongodb.uri, {
      dbName: config.mongodb.dbName,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
