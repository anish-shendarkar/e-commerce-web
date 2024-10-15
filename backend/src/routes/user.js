const express = require('express');
const bcrypt = require('bcryptjs');
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/db');
require('dotenv').config();

userRouter.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username: username });

        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
        });

        await newUser.save();

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);

        return res.status(201).json({
            message: 'User registered successfully',
            token: `Bearer ${token}`,
        });
    } catch (error) {
        console.error('Signup error: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username: username });
        if(!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

        return res.status(200).json({
            message: 'Signin Successful',
            token: `Bearer ${token}`,
        });
    } catch(error) {
        console.error('Signin Error: ', error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = userRouter;
