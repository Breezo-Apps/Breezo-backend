const aqiController = require("../controllers/aqiController");
const mlController = require("../controllers/mlController");

const aqiRoutes = [
  {
    method: "GET",
    path: "/aqi",
    handler: aqiController.home,
  },
  {
    method: "GET",
    path: "/aqi/detail",
    handler: aqiController.detail,
  },
  {
    method: "GET",
    path: "/aqi/prediction",
    handler: aqiController.prediction,
  },
  {
    method: "POST",
    path: "/aqi/save-history",
    options: {
      payload: {
        parse: true,
        output: "data",
        allow: "application/json",
      },
    },
    handler: aqiController.saveHistory,
  },
  {
    method: "GET",
    path: "/aqi/save-history-now",
    handler: aqiController.saveHistoryNow,
  },
  {
    method: "GET",
    path: "/aqi/prediction2",
    handler: mlController.prediction,
  },
];

module.exports = aqiRoutes;
