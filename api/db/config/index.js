import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

const db = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "balady",
  connectionLimit: 20,
});

db.getConnection();

export { db };
