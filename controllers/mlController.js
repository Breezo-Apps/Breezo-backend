const axios = require("axios");
const aqiIndex = require("../utils/aqiIndex");

const mlController = {
  prediction,
};

async function prediction(request, h) {
  try {
    const ml = await axios.get(
      `https://43207vdf-5000.asse.devtunnels.ms/predict`
    );

    const formattedData = ml.data.data.map((entry) => {
      const mainPolutant = entry.detail.reduce((max, pollutant) => {
        return pollutant.concentrate > max.concentrate ? pollutant : max;
      }, entry.detail[0]);

      const correctedMainPolutantConcentrate =
        mainPolutant.concentrate < 0 ? 0 : mainPolutant.concentrate;

      return {
        date: entry.date,
        time: entry.time,
        main_polutant: {
          aqi_index:
            mainPolutant.polutant_type === "co"
              ? aqiIndex(
                  mainPolutant.polutant_type,
                  correctedMainPolutantConcentrate / 1240
                )
              : aqiIndex(
                  mainPolutant.polutant_type,
                  correctedMainPolutantConcentrate
                ),
          polutant_type:
            mainPolutant.polutant_type === "pm2_5"
              ? "pm2.5"
              : mainPolutant.polutant_type,
          concentrate: correctedMainPolutantConcentrate,
        },
        detail: entry.detail.map((pollutant) => {
          const correctedConcentrate =
            pollutant.concentrate < 0 ? 0 : pollutant.concentrate;

          return {
            aqi_index:
              pollutant.polutant_type === "co"
                ? aqiIndex(pollutant.polutant_type, correctedConcentrate / 1240)
                : aqiIndex(pollutant.polutant_type, correctedConcentrate),
            polutant_type:
              pollutant.polutant_type === "pm2_5"
                ? "pm2.5"
                : pollutant.polutant_type,
            concentrate: correctedConcentrate,
          };
        }),
      };
    });

    return h
      .response({
        status: {
          code: 200,
          message: "Success",
        },
        data: formattedData,
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
