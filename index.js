const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ตั้งค่าข้อมูล THSMS ของคุณ ---
const THSMS_CONFIG = {
    apiKey: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVcvYXBpLWtleSIsImlhdCI6MTc4Njg0Mjg2MywibmJmIjoxNzg2ODQyODYzLCJqdGkiOiJzVWp2WkRlMUV0Rmg4OUVqIiwic3ViIjoxMTI1MDIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ._iPHlM6Xsj983H8J0JHr8rZ4DFZWBQJ-zYIlMYY2J9I"
};

app.post('/api/send-sms', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ success: false, message: 'Missing phone or message' });
        }

        // จัดรูปแบบเบอร์โทรศัพท์สำหรับประเทศไทย (รองรับทั้ง 08x และ +66...)
        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('+66')) {
            formattedPhone = '0' + formattedPhone.substring(3);
        }

        // THSMS API Endpoint สำหรับส่ง SMS
        const thsmsUrl = 'https://thsms.com/api/send-sms';

        // โครงสร้าง Payload ตามมาตรฐานของ THSMS API
        const payload = {
            sender: "NOTICE", // หรือชื่อ Sender Name ที่คุณลงทะเบียนไว้กับ THSMS
            msisdn: [formattedPhone],
            message: message
        };

        const response = await axios.post(thsmsUrl, payload, {
            headers: {
                'Authorization': `Bearer ${THSMS_CONFIG.apiKey}`, // ใช้ Bearer Token จาก API Key
                'Content-Type': 'application/json'
            }
        });

        console.log(`SMS Sent successfully via THSMS to ${formattedPhone}`);
        return res.json({ success: true, data: response.data });

    } catch (error) {
        console.error('THSMS Error Detail:', error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send('MKT Hospital THSMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});