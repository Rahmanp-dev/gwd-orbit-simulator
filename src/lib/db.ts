import mongoose from 'mongoose';
import '@/models';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Detect if URI is missing or a known placeholder
const isPlaceholder = !MONGODB_URI 
  || MONGODB_URI.includes('your-user') 
  || MONGODB_URI.includes('your-password')
  || MONGODB_URI.includes('cluster.mongodb.net') && !MONGODB_URI.includes('@');

let _memoryMode = false;
let _memoryServer: any = null;

/** Returns true if the app is running against an in-memory MongoDB (dev/demo mode) */
export function isMemoryMode(): boolean {
  return _memoryMode;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Eagerly pre-warm the database connection + seed in the background.
 *
 * Why: the in-memory MongoDB + seed takes ~2.5s on first use. If that happens
 * lazily inside the first user API request, that one request pays the full cost
 * and feels frozen. By kicking it off at module load (which runs during the
 * server's Turbopack compile window), the connection is usually ready by the
 * time the first request arrives.
 *
 * This just invokes dbConnect(); dbConnect itself manages cached.promise, so
 * there is no double-initialisation risk. Failures are swallowed here (the
 * real error surfaces on the next real dbConnect()).
 */
function prewarmDatabase(): void {
  if (cached.conn || cached.promise) return;
  // Fire and forget — dbConnect populates cached.promise/conn internally.
  dbConnect().catch((err) => {
    console.error('[GWD DB] Pre-warm failed (will retry on next request):', err);
  });
}

// Kick off in the background — do not block module evaluation.
// Only do this in a runtime (not during the build's static collection step).
if (process.env.NEXT_RUNTIME) {
  prewarmDatabase();
}

async function startMemoryServer(): Promise<string> {
  // Dynamic import so mongodb-memory-server is only loaded in dev/fallback mode
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  
  if (!_memoryServer) {
    _memoryServer = await MongoMemoryServer.create();
    _memoryMode = true;
    if (process.env.NODE_ENV === "development") {
      console.log('[GWD DB] 🧪 In-memory MongoDB started (no real Atlas URI detected)');
      console.log('[GWD DB]    Data is ephemeral — lost on restart. Set MONGODB_URI for persistence.');
    }
  }
  return _memoryServer.getUri();
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    let uri = MONGODB_URI;

    // If no valid URI, fall back to in-memory MongoDB
    if (isPlaceholder) {
      try {
        uri = await startMemoryServer();
      } catch (err) {
        console.error('[GWD DB] ❌ Failed to start in-memory MongoDB:', err);
        console.error('[GWD DB]    Install it: npm i -D mongodb-memory-server');
        throw new Error(
          'No valid MONGODB_URI and mongodb-memory-server unavailable. ' +
          'Set MONGODB_URI in .env.local or install mongodb-memory-server.'
        );
      }
    }

    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
      minPoolSize: 1,
    };

    cached.promise = mongoose.connect(uri, opts);
  }

  try {
    cached.conn = await cached.promise;
    
    // Trigger eager index pre-warming in background
    import("@/lib/index-warmer").then(({ warmDatabaseIndexes }) => warmDatabaseIndexes().catch(() => {}));

    // Auto-seed in memory mode
    if (_memoryMode) {
      const { autoSeed } = await import('@/lib/seed-data');
      await autoSeed();
    }
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
