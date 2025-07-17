const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection (YOUR CREDENTIALS FILLED)
mongoose.connect('mongodb+srv://editing edition:TrY@#AgAiN@cluster0.vczb0.mongodb.net/editing-portfolio', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

// Register API
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await User.create({ name, email, password: hashedPassword });
        res.json({ status: 'ok' });
    } catch (err) {
        res.json({ status: 'error', error: 'Email Already Exists' });
    }
});

// Login API
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ status: 'error', user: false });
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ name: user.name, email: user.email }, 'secret123');
        return res.json({ status: 'ok', user: token });
    }
    res.json({ status: 'error', user: false });
});

// Dashboard API
app.get('/api/user/:token', (req, res) => {
    try {
        const user = jwt.verify(req.params.token, 'secret123');
        res.json({ status: 'ok', user });
    } catch (error) {
        res.json({ status: 'error', error: 'Invalid Token' });
    }
});

app.listen(5000, () => {
    console.log('✅ Backend running on http://localhost:5000');
});
