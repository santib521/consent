const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// เปิดใช้งาน CORS ให้หน้าเว็บเรียกใช้งานได้
app.use(cors());
app.use(express.json());

// ตั้งค่าข้อมูล SMS-KUB API ของคุณ
const SMSKUB_CONFIG = {
    endpoint: "https://console.sms-kub.com/api/send",
    apiKey: "gK6sDWwzsMWe7w9tpVirKIrNfqj5j9jH"
};

// API Endpoint สำหรับรับคำสั่งส่ง SMS จากหน้าเว็บ e-Consent
app.post('/api/send-sms', async (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, message: 'Missing phone or message' });
    }

    try {
        // ยิงคำขอไปยัง SMS-KUB API จริงฝั่ง Server-to-Server (ไม่ติด CORS)
        const response = await axios.post(SMSKUB_CONFIG.endpoint, {
            apiKey: SMSKUB_CONFIG.apiKey,
            to: phone,
            message: message
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(`SMS Sent Successfully to ${phone}`);
        res.json({ success: true, data: response.data });

    } catch (error) {
        console.error('SMS Gateway Error:', error.response?.data || error.message);
        res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

// ตรวจสอบสถานะการทำงานของ Server
app.get('/', (req, res) => {
    res.send('MKT Hospital SMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});