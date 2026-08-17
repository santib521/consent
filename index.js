const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const THSMS_CONFIG = {
    apiKey: process.env.THSMS_API_KEY || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVcvYXBpLWtleSIsImlhdCI6MTc4Njg0Mjg2MywibmJmIjoxNzg2ODQyODYzLCJqdGkiOiJzVWp2WkRlMUV0Rmg4OUVqIiwic3ViIjoxMTI1MDIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ._iPHlM6Xsj983H8J0JHr8rZ4DFZWBQJ-zYIlMYY2J9I"
};

// แปลงเบอร์โทรให้เป็นรูปแบบ 0XXXXXXXXX ที่ THSMS ต้องการ
// รองรับ "0874999456", "+66874999456", "66874999456", "0066874999456"
// และเบอร์ที่มีขีด/วงเล็บ/เว้นวรรคปน เช่น "087-499-9456"
function normalizePhone(raw) {
    if (raw === undefined || raw === null) return null;

    let phone = String(raw).trim().replace(/[\s\-()]/g, '');

    if (phone.startsWith('+66')) {
        phone = '0' + phone.slice(3);
    } else if (phone.startsWith('0066')) {
        phone = '0' + phone.slice(4);
    } else if (phone.startsWith('66') && phone.length === 11) {
        phone = '0' + phone.slice(2);
    }

    if (!/^0\d{9}$/.test(phone)) {
        return null; // ไม่ใช่รูปแบบเบอร์มือถือไทยที่ถูกต้อง
    }

    return phone;
}

app.post('/api/send-sms', async (req, res) => {
    try {
        const { message } = req.body;
        // รับได้ทั้ง phone (เดี่ยว) และ msisdn (array แบบเดียวกับที่ยิงตรงผ่าน Postman)
        const rawPhones = req.body.msisdn ?? req.body.phone;

        if (!rawPhones || !message) {
            return res.status(400).json({ success: false, message: 'Missing phone or message' });
        }

        const phoneList = Array.isArray(rawPhones) ? rawPhones : [rawPhones];
        const msisdn = phoneList.map(normalizePhone);

        if (msisdn.includes(null)) {
            return res.status(400).json({ success: false, message: 'Invalid phone number format', invalid: phoneList.filter((_, i) => msisdn[i] === null) });
        }

        const thsmsUrl = 'https://thsms.com/api/send-sms';

        const payload = {
            sender: "SMSOTP",
            msisdn,
            message: message
        };

        const response = await axios.post(thsmsUrl, payload, {
            headers: {
                'Authorization': `Bearer ${THSMS_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        console.log(`SMS Sent successfully via THSMS to ${msisdn.join(', ')}`, response.data);
        return res.json({ success: true, data: response.data });

    } catch (error) {
        const errorDetail = error.response?.data || error.message;
        console.error('THSMS Error Detail:', errorDetail);

        return res.status(error.response?.status || 500).json({
            success: false,
            error: errorDetail
        });
    }
});

app.get('/', (req, res) => {
    res.send('MKT Hospital THSMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});