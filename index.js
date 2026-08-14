const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ตั้งค่าข้อมูล ClickSend ของคุณ ---
const CLICKSEND_CONFIG = {
    username: "santib521@gmail.com",
    apiKey: "2467C4C3-CF7F-51A9-676A-547CA8D2E71F"
};

app.post('/api/send-sms', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ success: false, message: 'Missing phone or message' });
        }

        // แปลงเบอร์โทรให้เป็นรูปแบบสากล (ClickSend รองรับเครื่องหมาย + เช่น +66813338900)
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '+66' + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
        }

        // ClickSend REST API Endpoint สำหรับส่ง SMS
        const clickSendUrl = 'https://rest.clicksend.com/v3/sms/send';

        // รูปแบบ Payload ตามมาตรฐาน ClickSend API
        const payload = {
            messages: [
                {
                    source: "node",
                    from: "MKT_Hospital",
                    body: message,
                    to: formattedPhone
                }
            ]
        };

        // ทำ Basic Authentication ด้วย Username และ API Key ของ ClickSend
        const authHeader = 'Basic ' + Buffer.from(`${CLICKSEND_CONFIG.username}:${CLICKSEND_CONFIG.apiKey}`).toString('base64');

        const response = await axios.post(clickSendUrl, payload, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        console.log(`SMS Sent successfully via ClickSend to ${formattedPhone}`);
        return res.json({ success: true, data: response.data });

    } catch (error) {
        console.error('ClickSend Error Detail:', error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

app.get('/', (devReq, res) => {
    res.send('MKT Hospital ClickSend SMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});