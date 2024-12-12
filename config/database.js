const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const db = mysql.createPool({
  host: process.env.HOST_DB,
  user: process.env.USER_DB,
  password: "",
  database: process.env.DATABASE_DB,
});

module.exports = db;
