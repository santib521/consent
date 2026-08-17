const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const THSMS_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC90aHNtcy5jb21cL21hbmFnZVcvYXBpLWtleSIsImlhdCI6MTc4Njg0Mjg2MywibmJmIjoxNzg2ODQyODYzLCJqdGkiOiJzVWp2WkRlMUV0Rmg4OUVqIiwic3ViIjoxMTI1MDIsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ._iPHlM6Xsj983H8J0JHr8rZ4DFZWBQJ-zYIlMYY2J9I";

app.post('/api/send-sms', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ success: false, message: 'Missing phone or message' });
        }

        let formattedPhone = phone.trim();
        if (formattedPhone.startsWith('+66')) {
            formattedPhone = '0' + formattedPhone.substring(3);
        }

        const response = await axios.post('https://thsms.com/api/send-sms', {
            sender: "SMSOTP",
            msisdn: [formattedPhone],
            message: message
        }, {
            headers: {
                'Authorization': `Bearer ${THSMS_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`THSMS Success:`, response.data);
        return res.json({ success: true, data: response.data });

    } catch (error) {
        console.error('THSMS Error Response:', error.response?.data || error.message);
        return res.status(500).json({ 
            success: false, 
            error: error.response?.data || error.message 
        });
    }
});

app.get('/', (req, res) => {
    res.send('THSMS Proxy Server is running.');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});