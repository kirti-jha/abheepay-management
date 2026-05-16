require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing in process.env!");
} else {
  connectionString = connectionString.replace('&channel_binding=require', '').replace('?channel_binding=require', '');
  console.log("Cleaned DATABASE_URL for Neon WebSocket driver:", connectionString.slice(0, 30) + "...");
}

neonConfig.connectionString = connectionString;
process.env.DATABASE_URL = connectionString;

// Pass { connectionString } directly to PrismaNeon in Prisma v7.8.0!
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
