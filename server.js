const Hapi = require('@hapi/hapi');
const weatherRoutes = require('./routes/weatherRoutes');
const weatherRoutes = require('./routes/weather');


const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    server.route(weatherRoutes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();

