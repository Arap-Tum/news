const pkg = require("pg");
const dotenv = require("dotenv");
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

//Test the connection 
(async () => {
  try {
     const client = await pool.connect();
    console.log("✅ Connected to the database successfully");
    client.release(); // release connection back to pool
  } catch (error) {
    console.error("❌ Failed to connect to the database:", err.message);
  }
})

module.exports = pool;
