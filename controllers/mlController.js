const axios = require("axios");
const aqiIndex = require("../utils/aqiIndex");

const mlController = {
  hourlyForcast,
  sevenDayForecast,
};

const lat = "-6.175110";
const lon = "106.865036";

async function hourlyForcast(request, h) {
  try {
    const payload = {
      lat: lat,
      lon: lon,
    };

    const url =
      "https://flask-weather-app-646402191362.asia-southeast2.run.app/api/aqi/components/hourly";

    const res = await axios.post(url, payload);

    if (res.status === 200) {
      const data = res.data;

      const processedData = data.map((entry) => {
        const timestamp = new Date(entry.datetime).getTime();
        const timestampWIB = timestamp + 8 * 60 * 60 * 1000;
        const datetimeWIB = new Date(timestampWIB);
        const date = datetimeWIB.toLocaleDateString("en-GB");
        const time = `${datetimeWIB.getHours()}:${datetimeWIB
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const pollutants = [
          { type: "co", concentration: entry.co / 1240 },
          { type: "no2", concentration: entry.no2 },
          { type: "o3", concentration: entry.o3 },
          { type: "so2", concentration: entry.so2 },
          { type: "pm2_5", concentration: entry.pm2_5 },
          { type: "pm10", concentration: entry.pm10 },
        ];

        const aqiDetails = pollutants.map((pollutant) => ({
          aqi_index: aqiIndex(pollutant.type, pollutant.concentration),
          polutant_type: pollutant.type,
          concentrate: pollutant.concentration.toFixed(2),
        }));

        const mainPolutant = aqiDetails.reduce((prev, current) =>
          prev.aqi_index > current.aqi_index ? prev : current
        );

        return {
          date: date,
          time: time,
          main_polutant: {
            aqi_index: mainPolutant.aqi_index,
            polutant_type: mainPolutant.polutant_type,
            concentrate: mainPolutant.concentrate,
          },
          detail: aqiDetails,
        };
      });

      return h
        .response({
          status: {
            code: 200,
            message: "Success",
          },
          data: processedData,
        })
        .code(200);
    }
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

async function sevenDayForecast(request, h) {
  try {
    const payload = {
      lon: lon,
      lat: lat,
    };
    const url =
      "https://flask-weather-app-646402191362.asia-southeast2.run.app/api/aqi/components/daily";
    const res = await axios.post(url, payload);

    const processData = (data) => {
      const dataPerHari = data.reduce((acc, item) => {
        const timestamp = new Date(item.datetime).getTime();
        const timestampWIB = timestamp + 8 * 60 * 60 * 1000;
        const datetimeWIB = new Date(timestampWIB);
        const date = datetimeWIB.toLocaleDateString("en-GB");
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(item);
        return acc;
      }, {});

      const hasilPerHari = Object.keys(dataPerHari).map((date) => {
        const dataHariIni = dataPerHari[date];
        const jumlahData = dataHariIni.length;

        const pollutants = [
          { type: "co", concentration: 0 },
          { type: "no2", concentration: 0 },
          { type: "o3", concentration: 0 },
          { type: "so2", concentration: 0 },
          { type: "pm2_5", concentration: 0 },
          { type: "pm10", concentration: 0 },
        ];

        dataHariIni.forEach((item) => {
          pollutants.forEach((pollutant) => {
            if (pollutant.type === "co") {
              pollutant.concentration += item.co / 1240;
            } else {
              pollutant.concentration += item[pollutant.type];
            }
          });
        });

        pollutants.forEach((pollutant) => {
          pollutant.concentration /= jumlahData;
          pollutant.aqi_index = aqiIndex(
            pollutant.type,
            pollutant.concentration
          );
        });

        const mainPollutant = pollutants.reduce(
          (max, current) => (current.aqi_index > max.aqi_index ? current : max),
          pollutants[0]
        );

        const timestamp = new Date(dataHariIni[0].datetime).getTime();
        const timestampWIB = timestamp + 7 * 60 * 60 * 1000;
        const datetimeWIB = new Date(timestampWIB);
        const tanggal = datetimeWIB.toLocaleDateString("en-GB");

        return {
          date: tanggal,
          main_polutant: {
            aqi_index: mainPollutant.aqi_index,
            pollutant_type: mainPollutant.type,
            concentrate: mainPollutant.concentration.toFixed(2),
          },
          detail: pollutants.map((pollutant) => ({
            aqi_index: pollutant.aqi_index,
            pollutant_type: pollutant.type,
            concentrate: pollutant.concentration.toFixed(2),
          })),
        };
      });

      return hasilPerHari;
    };

    const transformedData = processData(res.data);

    return h
      .response({
        status: {
          code: 200,
          message: "Success",
        },
        data: transformedData,
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

module.exports = mlController;
