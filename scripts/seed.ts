/**
 * Standalone Database Seeding Script for GWD Orbit Simulator
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gwd_orbit_simulator";

async function seed() {
  console.log("🌱 Connecting to MongoDB:", MONGODB_URI);
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected. Seeding data...");
    console.log("🏆 Seeding complete. You can also trigger seeding via POST /api/seed in the app.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

if (typeof require !== "undefined" && require.main === module) {
  seed();
}
