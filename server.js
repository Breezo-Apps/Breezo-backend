const Hapi = require('@hapi/hapi');
const weatherRoutes = require('./routes/weatherRoutes');
const dailyWeatherRoutes = require('./cron/weather');

const init = async() => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    // Menambahkan routes
    server.route(weatherRoutes);
    server.route(dailyWeatherRoutes);

    // Menjalankan server
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();