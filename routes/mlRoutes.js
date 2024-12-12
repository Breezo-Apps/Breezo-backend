const mlController = require("../controllers/mlController");

const mlRoutes = [
  {
    method: "GET",
    path: "/aqi/hourly-forecast",
    handler: mlController.hourlyForcast,
  },
  {
    method: "GET",
    path: "/aqi/daily-forecast",
    handler: mlController.sevenDayForecast,
  },
];

module.exports = mlRoutes;
