const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require("mongodb");

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
}

// Route to retrieve account summary
recordRoutes.route("/account/summary").get(isAuthenticated, async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const user = await db_connect.collection("users").findOne(
            { _id: new ObjectId(req.session.userId) },
            { projection: { password: 0 } }
        );
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to retrieve account balances and allow deposit/withdraw
recordRoutes.route("/account/balances").get(isAuthenticated, async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const user = await db_connect.collection("users").findOne(
            { _id: new ObjectId(req.session.userId) },
            { projection: { checking: 1, savings: 1 } }
        );
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to deposit money into an account
recordRoutes.route("/record/account/deposit").post(isAuthenticated, async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const { amount, accountType } = req.body;

        if (!['checking', 'savings'].includes(accountType)) {
            return res.status(400).json({ error: "Invalid account type." });
        }

        const updateField = accountType === 'checking' ? 'checking' : 'savings';
        const result = await db_connect.collection("users").updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $inc: { [updateField]: amount } }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: "Deposit successful." });
        } else {
            res.status(404).json({ error: "User not found." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route to withdraw money from an account
recordRoutes.route("/record/account/withdraw").post(isAuthenticated, async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const { amount, accountType } = req.body;

        if (!['checking', 'savings'].includes(accountType)) {
            return res.status(400).json({ error: "Invalid account type." });
        }

        const user = await db_connect.collection("users").findOne({ _id: new ObjectId(req.session.userId) });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }

        const currentBalance = user[accountType];
        if (currentBalance < amount) {
            return res.status(400).json({ error: "Insufficient funds." });
        }

        const result = await db_connect.collection("users").updateOne(
            { _id: new ObjectId(req.session.userId) },
            { $inc: { [accountType]: -amount } }
        );
        res.json({ message: "Withdrawal successful." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = recordRoutes;
