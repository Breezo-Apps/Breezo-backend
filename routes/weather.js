const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost', // Ganti sesuai dengan pengaturan MySQL Anda
    user: 'root', // Ganti dengan username MySQL Anda
    password: '', // Ganti dengan password MySQL Anda
    database: 'brezzo', // Nama database
});

const weatherRoutes = [{
    method: 'GET',
    path: '/api/home/daily',
    handler: async(request, h) => {
        try {
            // Query data dari database
            const [rows] = await pool.query('SELECT date, degree, degree_img FROM daily ORDER BY date ASC');
            return rows;
        } catch (err) {
            console.error(err);
            return h.response({ error: 'Failed to fetch weather data' }).code(500);
        }
    },
}, ];

module.exports = weatherRoutes;