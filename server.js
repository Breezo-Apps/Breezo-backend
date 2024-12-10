const Hapi = require("@hapi/hapi");
const dailyWeatherRoutes = require("./cron/weather");
const aqiRoutes = require("./routes/aqiRoutes");
const userRoutes = require("./routes/userRoutes");
const dotenv = require("dotenv");
dotenv.config();

const init = async() => {
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
    });

    server.route(dailyWeatherRoutes);
    server.route(aqiRoutes);
    server.route(userRoutes);


    await server.start();
    console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
    console.error(err);
    process.exit(1);
});

init();