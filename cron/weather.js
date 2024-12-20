const mysql = require("mysql2/promise");
const cron = require("node-cron");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "brezzo",
});

async function addWeatherData() {
  try {
    const degree = Math.floor(24 + Math.random() * 10);
    const weatherConditions = ["cerah", "berawan", "mendung", "hujan"];
    const degreeImg =
      weatherConditions[Math.floor(Math.random() * weatherConditions.length)];

    const query = `INSERT INTO daily (date, degree, degree_img) VALUES (NOW(), ?, ?)`;
    await pool.query(query, [degree, degreeImg]);
    console.log("Weather data added successfully!");
  } catch (err) {
    console.error("Error adding weather data:", err);
  }
}

// cron.schedule("0 * * * *", () => {
//   console.log("Running cron job: Adding new weather data...");
//   addWeatherData();
// });

const dailyWeatherRoutes = [
  {
    method: "GET",
    path: "/api/home/daily",
    handler: async (request, h) => {
      try {
        const [rows] = await pool.query(
          "SELECT date, degree, degree_img FROM daily ORDER BY date ASC"
        );
        return rows;
      } catch (err) {
        console.error(err);
        return h.response({ error: "Failed to fetch weather data" }).code(500);
      }
    },
  },
];

module.exports = dailyWeatherRoutes;
