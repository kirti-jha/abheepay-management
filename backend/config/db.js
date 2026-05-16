const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');

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

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString
    }
  }
});

module.exports = prisma;
