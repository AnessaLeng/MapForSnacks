const express = require('express');
const User = require('../models/User');
const router = express.Router();

// POST endpoint to create a new user
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const newUser = new User({ first_name, last_name, email, password });
    try {
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET endpoint to retrieve users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;