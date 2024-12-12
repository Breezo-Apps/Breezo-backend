const db = require("../config/database");
const axios = require("axios");
const cron = require("node-cron");
const aqiIndex = require("../utils/aqiIndex");

const aqiController = {
  home,
  detail,
  saveHistory,
};

const lat = "-6.175110";
const lon = "106.865036";
const key = process.env.API_KEY;

async function home(request, h) {
  try {
    const weather = await axios.get(
      `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}`
    );
    const rawData = weather.data;
    const tempCelsius = (rawData.main.temp - 273.15).toFixed(0);

    const now = new Date();
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const dayName = days[now.getDay()];
    const day = now.getDate();
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const monthName = monthNames[now.getMonth()];
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const formattedDate = `${dayName}, ${day} ${monthName}`;
    const formattedTime = `${hours}:${minutes}`;

    const weatherId = rawData.weather[0].id;
    const isNight = hours >= 18 || hours < 6;
    let weatherDescription = "Unknown";
    if (weatherId === 800) {
      weatherDescription = isNight ? "Full Moon" : "Sunny";
    } else if (weatherId === 801) {
      weatherDescription = isNight ? "Partly Cloudy Moon" : "Partly Cloudy";
    } else if (weatherId === 802 || weatherId === 803) {
      weatherDescription = isNight ? "Mostly Cloudy Moon" : "Mostly Cloudy";
    } else if (weatherId === 804) {
      weatherDescription = "Cloudy";
    } else if (weatherId >= 701 && weatherId <= 781) {
      weatherDescription = "Foggy";
    } else if (
      (weatherId >= 500 && weatherId <= 531) ||
      (weatherId >= 300 && weatherId <= 321)
    ) {
      weatherDescription = "Rainy";
    } else if (weatherId >= 600 && weatherId <= 622) {
      weatherDescription = "Snowy";
    } else if (weatherId >= 200 && weatherId <= 232) {
      weatherDescription = "Stormy";
    }

    const resData = {
      city: "Jakarta",
      degree: tempCelsius,
      degree_img: weatherDescription,
      wind: rawData.wind.speed,
      humidity: rawData.main.humidity,
      date: formattedDate,
      time: formattedTime,
    };

    return h
      .response({
        status: {
          code: 200,
          message: "Success",
        },
        data: resData,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: {
          code: 500,
          message: error.message,
        },
      })
      .code(500);
  }
}

async function detail(request, h) {
  try {
    const weather = await axios.get(
      `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`
    );
    const rawData = weather.data;

    const detail = [
      {
        aqi_index: aqiIndex("co", rawData.list[0].components.co / 1240),
        polutant_type: "co",
        concentrate: rawData.list[0].components.co / 1240,
      },
      {
        aqi_index: aqiIndex("no2", rawData.list[0].components.no2),
        polutant_type: "no2",
        concentrate: rawData.list[0].components.no2,
      },
      {
        aqi_index: aqiIndex("o3", rawData.list[0].components.o3),
        polutant_type: "o3",
        concentrate: rawData.list[0].components.o3,
      },
      {
        aqi_index: aqiIndex("so2", rawData.list[0].components.so2),
        polutant_type: "so2",
        concentrate: rawData.list[0].components.so2,
      },
      {
        aqi_index: aqiIndex("pm2_5", rawData.list[0].components.pm2_5),
        polutant_type: "pm2.5",
        concentrate: rawData.list[0].components.pm2_5,
      },
      {
        aqi_index: aqiIndex("pm10", rawData.list[0].components.pm10),
        polutant_type: "pm10",
        concentrate: rawData.list[0].components.pm10,
      },
    ];

    const main = detail.reduce((max, current) =>
      current.aqi_index > max.aqi_index ? current : max
    );

    const resData = {
      main,
      detail,
    };

    return h
      .response({
        status: {
          code: 200,
          message: "Success",
        },
        data: resData,
      })
      .code(200);
  } catch (error) {
    return h
      .response({
        status: {
          code: 500,
          message: error.message,
        },
      })
      .code(500);
  }
}

async function saveHistory(request, h) {
  try {
    const { start, end } = request.payload;

    const weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${key}`
    );

    if (!weather.data.list) {
      throw new Error('Data "list" tidak ditemukan pada response API');
    }

    const dataList = weather.data.list;
    for (const item of dataList) {
      const dt = item.dt;
      const date = new Date(dt * 1000);
      date.setHours(date.getHours() + 7);
      const formattedDate = date.toISOString().slice(0, 19).replace("T", " ");

      const { co, no2, o3, so2, pm2_5, pm10 } = item.components;
      const query = `
        INSERT INTO aqi_daily (date, co, no2, o3, so2, pm2_5, pm10)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      await new Promise((resolve, reject) => {
        db.execute(
          query,
          [formattedDate, co, no2, o3, so2, pm2_5, pm10],
          (err, results) => {
            if (err) {
              console.error("Error inserting data into database:", err);
              reject(err);
            } else {
              console.log("Data inserted successfully:", results);
              resolve(results);
            }
          }
        );
      });
    }

    return h
      .response({
        status: {
          code: 200,
          message: "Success",
        },
        data: weather.data,
      })
      .code(200);
  } catch (error) {
    console.error("Error:", error);
    return h
      .response({
        status: {
          code: 500,
          message: error.message,
        },
      })
      .code(500);
  }
}

async function saveHistoryCron() {
  try {
    const currentDate = new Date();
    currentDate.setMinutes(0, 0, 0);

    const end = Math.floor(currentDate.getTime() / 1000);
    const start = end;

    const weather = await axios.get(
      `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${key}`
    );

    if (!weather.data.list || weather.data.list.length === 0) {
      console.log(
        "Pending cron job: No data found for weather pollution history. Waiting for the next attempt..."
      );
      return;
    }

    const item = weather.data.list[0];
    const dt = item.dt;
    const date = new Date(dt * 1000);
    date.setHours(date.getHours() + 7);
    const formattedDate = date.toISOString().slice(0, 19).replace("T", " ");

    const { co, no2, o3, so2, pm2_5, pm10 } = item.components;

    const checkQuery = `
      SELECT COUNT(*) AS count
      FROM aqi_daily
      WHERE date = ?
      `;

    const dataExists = await new Promise((resolve, reject) => {
      db.execute(checkQuery, [formattedDate], (err, results) => {
        if (err) {
          console.log("Error cron job: Failed to check existing data.");
          reject("Error cron job: Data check failed.");
        } else {
          resolve(results[0].count > 0);
        }
      });
    });

    if (dataExists) {
      console.log(
        `Skipped cron job: Data for ${formattedDate} already exists. Skipping insertion.`
      );
      return;
    }

    console.log(
      `Running cron job: Inserting data for ${formattedDate} into the database...`
    );

    const insertQuery = `
    INSERT INTO aqi_daily (date, co, no2, o3, so2, pm2_5, pm10)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await new Promise((resolve, reject) => {
      db.execute(
        insertQuery,
        [formattedDate, co, no2, o3, so2, pm2_5, pm10],
        (err, results) => {
          if (err) {
            console.log("Error cron job: Failed to insert data.");
            reject("Error cron job: Data insertion failed.");
          } else {
            console.log("Success cron job: Data successfully inserted.");
            resolve(results);
          }
        }
      );
    });
  } catch (error) {
    console.log(`Error cron job: An error occurred - ${error.message}`);
  }
}

cron.schedule("0 * * * *", () => {
  console.log("Running cron job: Adding new weather data...");
  saveHistoryCron();
});

module.exports = aqiController;
