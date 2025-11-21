require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenAI } = require('@google/genai');
const User = require('./models/User');

const app = express();

// Enable CORS for all origins (needed for separate frontend/backend deployment)
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/divyadrishti')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// --- AI Client ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-2.5-flash";

// --- Middleware ---
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_fallback';
    const verified = jwt.verify(token, secret);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.send('Divya Drishti Backend is Running! 🚀');
});

// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, password, name, dob, time, place } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
      name, dob, time, place
    });

    const savedUser = await newUser.save();
    
    // Create Token
    const secret = process.env.JWT_SECRET || 'dev_secret_fallback';
    const token = jwt.sign({ _id: savedUser._id }, secret);
    
    res.json({ 
      token, 
      user: { 
        id: savedUser._id, 
        username: savedUser.username, 
        name: savedUser.name,
        place: savedUser.place,
        dob: savedUser.dob,
        time: savedUser.time,
        activities: savedUser.activities 
      } 
    });
  } catch (err) {
    console.error("Signup Error:", err.message); // Don't log full error object to avoid leaking data
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // SECURITY: Explicitly select password field because it's hidden by default
    const user = await User.findOne({ username }).select('+password');
    
    if (!user) return res.status(400).json({ error: "User not found" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Invalid password" });

    const secret = process.env.JWT_SECRET || 'dev_secret_fallback';
    const token = jwt.sign({ _id: user._id }, secret);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        name: user.name,
        place: user.place,
        dob: user.dob,
        time: user.time,
        activities: user.activities 
      } 
    });
  } catch (err) {
    console.error("Login Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/history', auth, async (req, res) => {
  try {
    const { type, title } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.activities.unshift({ type, title, timestamp: Date.now() });
    // Keep only last 50
    if (user.activities.length > 50) user.activities = user.activities.slice(0, 50);
    await user.save();
    res.json(user.activities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user/delete', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user._id);
        res.json({ message: "Account deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- AI Routes (Proxy) ---
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, schema } = req.body;
    
    const config = {};
    if (schema) {
        config.responseMimeType = "application/json";
        config.responseSchema = schema;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config
    });

    res.json({ text: response.text });
  } catch (err) {
    // Send 429 explicitly if quota exceeded so frontend handles fallback
    if (JSON.stringify(err).includes("429") || JSON.stringify(err).includes("RESOURCE_EXHAUSTED")) {
        return res.status(429).json({ error: "Quota Exceeded" });
    }
    console.error("AI Generation Error: Internal");
    res.status(500).json({ error: "AI Generation Failed" });
  }
});

app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, history, systemInstruction } = req.body;
        const chat = ai.chats.create({
            model: modelName,
            config: { systemInstruction },
            history: history
        });
        const result = await chat.sendMessage({ message });
        res.json({ text: result.text });
    } catch (err) {
        if (JSON.stringify(err).includes("429")) {
            return res.status(429).json({ error: "Quota Exceeded" });
        }
        console.error("Chat Error: Internal");
        res.status(500).json({ error: "Chat Failed" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
