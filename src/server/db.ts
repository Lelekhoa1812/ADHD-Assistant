import { MongoClient, Db } from 'mongodb'

if (!process.env.MONGO_URI) {
  throw new Error('Please add your Mongo URI to environment variables')
}

const uri = process.env.MONGO_URI

// Connection options optimized for serverless
const options = {
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// Use a global variable to store the MongoClient promise in serverless environments
// This prevents creating multiple connections during hot reloads and in serverless functions
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // In production (Vercel serverless), also use global to cache the connection
  // across function invocations within the same container
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise

export async function getDb(): Promise<Db> {
  try {
    const client = await clientPromise
    return client.db('adhd-assistant')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error('Failed to connect to database')
  }
}

