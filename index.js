const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const THSMS_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVcvYXBpLWtleSIsImlhdCI6MTc4Njg0Mjg2MywibmJmIjoxNzg2ODQyODYzLCJqdGkiOiJzVWp2WkRlMUV0Rmg4OUVqIiwic3ViIjoxMTI1MDIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ._iPHlM6Xsj983H8J0JHr8rZ4DFZWBQJ-zYIlMYY2J9I";

// ป้ายกำกับพิสูจน์เวอร์ชันโค้ด
const PROOF_VERSION_TAG = "PROVE_THSMS_V2_SUCCESS_2026";

app.post('/api/send-sms', async (req, res) => {
    const targetUrl = 'https://thsms.com/api/send-sms';
    
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ 
                success: false, 
                proofTag: PROOF_VERSION_TAG,
                message: 'Missing phone or message' 
            });
        }

        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('+66')) {
            formattedPhone = '0' + formattedPhone.substring(3);
        }

        const payload = {
            sender: "SMSOTP",
            msisdn: [formattedPhone],
            message: message
        };

        // ส่ง Request ไปยัง THSMS พร้อมบันทึกหลักฐาน
        const response = await axios.post(targetUrl, payload, {
            headers: {
                'Authorization': `Bearer ${THSMS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // ส่ง Response กลับพร้อมหลักฐานพิสูจน์ว่าโค้ดนี้ทำงานจริง
        return res.json({ 
            success: true, 
            proofTag: PROOF_VERSION_TAG,
            targetUrlUsed: targetUrl,
            thsmsResponse: response.data 
        });

    } catch (error) {
        // หากเกิด Error จะส่งข้อมูลดิบกลับมาให้เห็นใน Network Tab ทันที
        return res.status(500).json({ 
            success: false, 
            proofTag: PROOF_VERSION_TAG,
            targetUrlUsed: targetUrl,
            errorDetail: error.response?.data || error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send(`Proxy is running. Proof Version: ${PROOF_VERSION_TAG}`);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [Tag: ${PROOF_VERSION_TAG}]`);
});