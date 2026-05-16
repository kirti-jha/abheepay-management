const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../.env');

if (!process.env.VERCEL && fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, quiet: true });
}
