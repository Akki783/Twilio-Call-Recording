require("dotenv").config();
const { axios } = require("axios");

const response = await axios.get(recordingUrl, {
    responseType: 'arraybuffer',
    auth: {
        username: process.env.TWILIO_ACCOUNT_SID,
        password: process.env.TWILIO_AUTH_TOKEN,
    }
});

