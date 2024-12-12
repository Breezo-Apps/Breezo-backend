const aqiController = require("../controllers/aqiController");

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
];

module.exports = aqiRoutes;
