
// const { Pool } = require('pg');
// require('dotenv').config();

// // Create a new pool instance with the connection details
// // The library will automatically use the environment variables
// // (PGUSER, PGHOST, PGDATABASE, PGPASSWORD, PGPORT)
// // if they are available. We are using a custom config for clarity.
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_DATABASE,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
//   // Add client encoding to ensure proper UTF-8 handling
//   clientEncoding: 'UTF8',
//   // Add connection string encoding
//   connectionString: process.env.DATABASE_URL,
//   // Add additional connection options for better UTF-8 support
//   ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
//   // Set statement timeout to prevent hanging queries
//   statement_timeout: 10000,
//   // Set query timeout to prevent long-running queries
//   query_timeout: 10000,
// });

// // Export the pool so it can be used in other parts of the application
// module.exports = {
//   query: (text, params) => pool.query(text, params),
//   // Add a method to check connection
//   checkConnection: async () => {
//     try {
//       const result = await pool.query('SELECT NOW()');
//       console.log('Database connected successfully:', result.rows[0]);
//       return true;
//     } catch (error) {
//       console.error('Database connection error:', error);
//       return false;
//     }
//   }
// };







// In config/db.js

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  clientEncoding: 'UTF8',
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  statement_timeout: 10000,
  query_timeout: 10000,
});

module.exports = {
  // Your existing query function for single, non-transactional queries
  query: (text, params) => pool.query(text, params),
  
  /**
   * --- ADD THIS LINE ---
   * This function allows other parts of your application to "check out" a
   * client from the pool to run multiple queries in a single transaction.
   */
  getClient: () => pool.connect(),

  // Your existing connection check function
  checkConnection: async () => {
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connected successfully:', result.rows[0]);
      return true;
    } catch (error) {
      console.error('Database connection error:', error);
      return false;
    }
  }
};