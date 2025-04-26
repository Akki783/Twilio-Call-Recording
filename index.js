const express = require('express');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON body
app.use(express.json());

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// API Route
app.post('/upload-recording', async (req, res) => {
    const { recordingUrl } = req.body;

    if (!recordingUrl) {
        return res.status(400).json({
            message: 'Recording URL is required'
        });
    }

    try {
        // Download the recording
        const response = await axios.get(recordingUrl, {
            responseType: 'arraybuffer',
            auth: {
                username: process.env.TWILIO_ACCOUNT_SID,
                password: process.env.TWILIO_AUTH_TOKEN,
            }
        });

        const recordingBuffer = Buffer.from(response.data, 'binary');

        // Upload to Cloudinary and convert to mp3
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'video', // Treat audio/video correctly
                    format: 'mp3'            // Force mp3 output
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(recordingBuffer);
        });

        res.json({ 
            message: 'Uploaded successfully!',
            cloudinaryMp3Url: uploadResponse.secure_url
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
