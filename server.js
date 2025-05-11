require('dotenv').config();

console.log('Server starting with environment variables:', {
    hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
    hasNamespaceId: !!process.env.CLOUDFLARE_KV_NAMESPACE_ID,
    hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN
});

const express = require('express');
const cors = require('cors');
const path = require('path');
const cloudflareKV = require('./services/cloudflareKV');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.get('/api/items', async (req, res) => {
    try {
        const items = await cloudflareKV.listKeys();
        res.json({ items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        const { key, value } = req.body;
        if (!key || !value) {
            return res.status(400).json({ error: 'Key and value are required' });
        }
        
        await cloudflareKV.putValue(key, value);
        res.status(201).json({ message: 'Item created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/items/:key', async (req, res) => {
    try {
        const { key } = req.params;
        const value = await cloudflareKV.getValue(key);
        
        if (value === null) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json({ key, value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/items/:key', async (req, res) => {
    try {
        const { key } = req.params;
        await cloudflareKV.deleteValue(key);
        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 