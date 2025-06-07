import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";
const ssl = isProduction ? true : false;

const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl,
  max: 10, // connectionLimit
  idleTimeoutMillis: 30000, // if db connection sits unused for more than 30 seconds, remove it from the pool.
  connectionTimeoutMillis: 20000, // how long to wait for connection
});

async function connectWithRetry(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      console.log("Successfully connected to PostgreSQL database!");
      client.release();
      break;
    } catch (err) {
      console.error(
        `⛔Attempt ${attempt} - Database connection failed:`,
        err.message
      );
      if (attempt === retries) {
        console.error("Exceeded max retries. Exiting.");
        process.exit(1); // Crash app if DB is unavailable
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

connectWithRetry();

export default pool;
