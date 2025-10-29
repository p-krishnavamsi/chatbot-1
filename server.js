import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config'; 

const app = express();
app.use(express.json({ limit: '50mb' })); 

app.post('/api/generate', async (req, res) => {
    
    const { contents } = req.body;
    
    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const RequestOption = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: contents }) 
    };

    try {
        const apiResponse = await fetch(API_URL, RequestOption);
        const data = await apiResponse.json();
        
        res.json(data); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch from Gemini API' });
    }
});

app.use(express.static('public')); 

const PORT = 5500;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});