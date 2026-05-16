require('./env');
const { PrismaNeon } = require('@prisma/adapter-neon');
const { PrismaClient } = require('@prisma/client');
const { neonConfig } = require('@neondatabase/serverless');
const ws = require('ws');

let connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_OJ0vwIr5fxke@ep-nameless-dew-ap3ih32n-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require';
if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is missing in process.env!");
}

// Ensure connection string has sslmode=require and no websocket channel binding
connectionString = connectionString.replace('&channel_binding=require', '').replace('?channel_binding=require', '');
if (!connectionString.includes('sslmode=require')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
}

process.env.DATABASE_URL = connectionString;

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
