const db = require('../config/database');

const weatherRoutes = [
    // Route untuk /api/home
    {
        method: 'GET',
        path: '/api/home',
        handler: async (request, h) => {
            const [rows] = await db.promise().query('SELECT * FROM weather ORDER BY id DESC LIMIT 1');
            if (rows.length === 0) {
                return h.response({ error: "Data tidak ditemukan" }).code(404);
            }
            return rows[0];
        },
    },

    // Route untuk POST /api/home
    {
        method: 'POST',
        path: '/api/home',
        handler: async (request, h) => {
            const { aqi, degree, degree_img, wind, humidity } = request.payload;

            if (!aqi || !degree || !degree_img || !wind || !humidity) {
                return h.response({ error: "Semua data wajib diisi." }).code(400);
            }

            const string_aqi = getAQIString(aqi);

            const [result] = await db.promise().query(
                'INSERT INTO weather (aqi, string_aqi, degree, degree_img, wind, humidity) VALUES (?, ?, ?, ?, ?, ?)',
                [aqi, string_aqi, degree, degree_img, wind, humidity]
            );

            return h.response({ message: "Data berhasil ditambahkan.", id: result.insertId }).code(201);
        },
    },

    // Route untuk GET /api/recommendation
    {
        method: 'GET',
        path: '/api/recommendation',
        handler: async (request, h) => {
            const [rows] = await db.promise().query('SELECT * FROM weather ORDER BY id DESC LIMIT 1');
            if (rows.length === 0) {
                return h.response({ error: "Data tidak ditemukan" }).code(404);
            }
            const weather = rows[0];
            weather.string_aqi = getAQIString(weather.aqi);
            return h.response({
                recommendation: getRecommendation(weather.string_aqi),
                data: weather
            });
        },
    },
];

// Fungsi untuk menentukan string AQI
const getAQIString = (aqi) => {
    if (aqi <= 50) return 'good';
    if (aqi <= 100) return 'moderate';
    if (aqi <= 150) return 'unhealthy for sensitive groups';
    if (aqi <= 200) return 'unhealthy';
    if (aqi <= 300) return 'very unhealthy';
    return 'hazardous';
};

// Fungsi untuk memberikan rekomendasi berdasarkan AQI
const getRecommendation = (string_aqi) => {
    switch (string_aqi) {
        case 'good':
            return 'Air kualitas baik, tidak ada tindakan khusus.';
        case 'moderate':
            return 'Perhatikan kondisi jika Anda memiliki masalah pernapasan ringan.';
        case 'unhealthy for sensitive groups':
            return 'Disarankan untuk membatasi aktivitas luar ruangan jika Anda memiliki masalah pernapasan.';
        case 'unhealthy':
            return 'Hindari aktivitas luar ruangan, terutama untuk anak-anak dan orang tua.';
        case 'very unhealthy':
            return 'Disarankan untuk menghindari aktivitas luar ruangan secara keseluruhan.';
        case 'hazardous':
            return 'Segera pindah ke area dengan kualitas udara yang lebih baik.';
        default:
            return 'Status AQI tidak dikenali.';
    }
};

module.exports = weatherRoutes;