const express = require("express");
const routes = express.Router();
const dbo = require("../db/conn");
const { ObjectId } = require("mongodb");

routes.route("/register").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        let user = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
            role: "",
            checking: 0,
            savings: 0
        };

        // Check for existing email
        const existingUser = await db_connect.collection("users").findOne({ email: user.email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const result = await db_connect.collection("users").insertOne(user);
        req.session.userId = result.insertedId.toString(); // Set session userId
        res.json({ message: "User account created successfully.", userId: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

routes.route("/login").post(async (req, res) => {
    try {
        let db_connect = dbo.getDb();
        const { email, password } = req.body;

        const user = await db_connect.collection("users").findOne({ email: email });
        if (user && user.password === password) {
            req.session.userId = user._id.toString(); // Set session userId
            res.json({ message: "Login successful." });
        } else {
            res.status(401).json({ error: "Invalid email or password." });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

routes.route("/logout").post((req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Could not log out, please try again." });
        } else {
            res.json({ message: "Logout successful." });
        }
    });
});

module.exports = routes;