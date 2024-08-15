const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const crypto = require('crypto');

// Route for user login
router.post('/login', async (req, res) => {
    try {
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection('Customers');
        const { customerID, password } = req.body;

        if (!customerID || !password) {
            return res.status(400).json({ error: 'The username and/or password was not entered correctly.' });
        }

        const customer = await collection.findOne({ customerID });
        if (!customer) {
            return res.status(400).json({ error: 'The username and/or password was not entered correctly.' });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        if (hashedPassword !== customer.hashedPassword) {
            return res.status(400).json({ error: 'The username and/or password was not entered correctly.' });
        }

        req.session.user = {
            customerID: customer.customerID,
            firstName: customer.firstName,
            lastName: customer.lastName,
            role: customer.role
        }; // Store only the necessary details in session

        res.json({ message: 'Login successful', user: req.session.user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;