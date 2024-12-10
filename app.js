'use strict';

const Hapi = require('@hapi/hapi');
const { Storage } = require('@google-cloud/storage');
const unzipper = require('unzipper');
const fs = require('fs');
const path = require('path');

// Inisialisasi Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.BUCKET_NAME;

const init = async() => {
    // Inisialisasi server Hapi
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: '0.0.0.0',
    });

    // Rute untuk unggahan file ZIP
    server.route({
        method: 'POST',
        path: '/upload',
        options: {
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                maxBytes: 10485760, // 10MB
            },
        },
        handler: async(request, h) => {
            const data = request.payload;
            const file = data.file;

            if (!file) {
                return h.response({ error: 'No file uploaded' }).code(400);
            }

            if (path.extname(file.hapi.filename) !== '.zip') {
                return h.response({ error: 'Only ZIP files are allowed' }).code(400);
            }

            const extractedFiles = [];

            try {
                // Ekstraksi file ZIP ke buffer
                await file.pipe(unzipper.Parse()).on('entry', async(entry) => {
                    const fileName = entry.path;
                    const content = await entry.buffer();

                    // Unggah file ke Cloud Storage
                    const blob = storage.bucket(bucketName).file(fileName);
                    await blob.save(content);

                    extractedFiles.push(fileName);
                }).promise();

                return h.response({
                    message: 'Files uploaded successfully',
                    files: extractedFiles,
                }).code(200);
            } catch (err) {
                console.error(err);
                return h.response({ error: 'Failed to process the ZIP file' }).code(500);
            }
        },
    });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();