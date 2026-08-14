const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ตั้งค่าข้อมูล Twilio ของคุณ ---
const TWILIO_CONFIG = {
    accountSid: "AC5bdf4ab6e4c0b1f8a8c35cd4468e42df",
    apiKey: "SKaca5862f00ae751f9a3cb816cbd20981",
    apiSecret: "f1fOKFEPam26odQV24LIVDgS180SxWWA",
    twiliophoneNumber: "+17372508034"
};

app.post('/api/send-sms', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, message: 'Missing phone or message' });
    }

    // แปลงเบอร์โทรไทย (เช่น 0813338900) ให้เป็นรูปแบบสากล (+66813338900)
    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('0')) {
        formattedPhone = '+66' + formattedPhone.substring(1);
    }

    // Twilio REST API Endpoint
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;

    // เตรียม Form Data สำหรับส่งไปยัง Twilio
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('From', TWILIO_CONFIG.twiliophoneNumber);
    params.append('Body', message);

    try {
        // ทำการ Basic Auth ด้วย API Key และ Secret
        const authHeader = 'Basic ' + Buffer.from(`${TWILIO_CONFIG.apiKey}:${TWILIO_CONFIG.apiSecret}`).toString('base64');

        const response = await axios.post(twilioUrl, params, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        console.log(`SMS Sent via Twilio to ${formattedPhone}`);
        res.json({ success: true, sid: response.data.sid });

    } catch (error) {
        console.error('Twilio Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send('MKT Hospital Twilio SMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});