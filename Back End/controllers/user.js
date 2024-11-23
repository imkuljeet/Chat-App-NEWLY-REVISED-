const User = require('../models/users');
const bcrypt = require('bcrypt');

const signup = async (req, res, next) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists, please login.' });
        }

        const saltrounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltrounds);
        
        const userCreated = await User.create({ 
            name, 
            email, 
            phone, 
            password: hashedPassword 
        });

        res.status(201).json({ success: true, user: userCreated });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const userToFind = await User.findOne({ where: { email } });
        if (!userToFind) {
            return res.status(404).json({ success: false, message: "User doesn't exist" });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordCorrect = await bcrypt.compare(password, userToFind.password);
        // console.log("FOUNDEUSER", isPasswordCorrect);

        if (isPasswordCorrect) {
            res.status(200).json({ success: true, message: "User logged in successfully" });
        } else {
            res.status(401).json({ success: false, message: "Incorrect Password" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = { signup, login };
