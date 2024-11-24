const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    database: 'brezzo', 
});

const weatherRoutes = [{
    method: 'GET',
    path: '/api/home/daily',
    handler: async(request, h) => {
        try {
            const [rows] = await pool.query('SELECT date, degree, degree_img FROM daily ORDER BY date ASC');
            return rows;
        } catch (err) {
            console.error(err);
            return h.response({ error: 'Failed to fetch weather data' }).code(500);
        }
    },
}, ];

module.exports = weatherRoutes;
