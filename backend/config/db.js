const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

let connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OJ0vwIr5fxke@ep-nameless-dew-ap3ih32n-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing in process.env!");
} else {
  connectionString = connectionString.replace('&channel_binding=require', '').replace('?channel_binding=require', '');
  console.log("Cleaned DATABASE_URL for Neon WebSocket driver:", connectionString.slice(0, 30) + "...");
}

neonConfig.connectionString = connectionString;
process.env.DATABASE_URL = connectionString;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
