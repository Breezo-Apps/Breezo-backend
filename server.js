const Hapi = require("@hapi/hapi");
const dotenv = require("dotenv");
const aqiRoutes = require("./routes/aqiRoutes");
const userRoutes = require("./routes/userRoutes");
const mlRoutes = require("./routes/mlRoutes");
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  server.route(aqiRoutes);
  server.route(mlRoutes);
  server.route(userRoutes);

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.error(err);
  process.exit(1);
});

init();
