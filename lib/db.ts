import mongoose from "mongoose"
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.DATA_BASE_URL!

if (!MONGODB_URI) {
  throw new Error(
    "Please define DATA_BASE_URL in .env.local"
  )
}

let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = {
    conn: null,
    promise: null,
  }
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(
      MONGODB_URI,
      {
        bufferCommands: false,
      }
    )
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    cached.promise = null
    cached.conn = null
    throw error
  }

  return cached.conn
}

let mongoClientCache: MongoClient | null = null

export function getMongoClient(): MongoClient {
  if (!mongoClientCache) {
    mongoClientCache = new MongoClient(MONGODB_URI)
  }
  return mongoClientCache
}