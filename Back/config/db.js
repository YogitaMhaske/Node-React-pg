const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "testdb",
  password: "Mahi@3332",
  port: 5432,
});

// DB connection
pool
  .connect()
  .then((client) => {
    return client
      .query("SELECT NOW()")
      .then((res) => {
        console.log("DB Connected successfully:", res.rows[0]);
        client.release(); 
      })
      .catch((err) => {
        client.release();
        console.error("Error executing test query:", err.stack);
      });
  })
  .catch((err) => {
    console.error("Failed to connect:", err.stack);
  });

module.exports = pool;
