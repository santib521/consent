const express = require('express');
const cors = require('cors');
const request = require('request');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Token ที่ทดสอบผ่านจริงจาก Postman
const THSMS_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVwvYXBpLWtleSIsImlhdCI6MTc4Njg0Mjg2MywibmJmIjoxNzg2ODQyODYzLCJqdGkiOiJzVWp2WkRlMUV0Rmg4OUVqIiwic3ViIjoxMTI1MDIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ._iPHlM6Xsj983H8J0JHr8rZ4DFZWBQJ-zYIlMYY2J9I";

app.post('/api/send-sms', (req, res) => {
    const { phone, message } = req.body;

    if (!phone || !message) {
        return res.status(400).json({ success: false, message: 'Missing phone or message' });
    }

    let formattedPhone = phone.trim();
    if (formattedPhone.startsWith('+66')) {
        formattedPhone = '0' + formattedPhone.substring(3);
    }

    // โครงสร้าง Body ตามคู่มือ THSMS Nodejs
    const data = {
        "sender": "SMSOTP",
        "msisdn": [formattedPhone],
        "message": message
    };

    // Options ตามคู่มือทางการของ THSMS
    const options = {
        method: 'POST',
        body: data,
        json: true,
        url: 'https://thsms.com/api/send-sms',
        headers: {
            'Authorization': THSMS_TOKEN,
            'Content-Type': 'application/json'
        }
    };

    request(options, function (error, response, body) {
        if (error) {
            console.error('THSMS Request Error:', error);
            return res.status(500).json({ success: false, error: error.message });
        }

        console.log('THSMS Response:', body);
        
        // ส่งผลลัพธ์กลับไปที่หน้าเว็บ
        const statusCode = response.statusCode || 200;
        return res.status(statusCode).json({
            success: statusCode === 200,
            data: body
        });
    });
});

app.get('/', (req, res) => {
    res.send('THSMS Proxy Server (Request Library) is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});