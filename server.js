const Hapi = require('@hapi/hapi');
const weatherRoutes = require('./routes/weather');


const init = async() => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    // Tambahkan routes
    server.route(weatherRoutes);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

// Start the server
process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();