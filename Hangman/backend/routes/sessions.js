const express = require('express');
const session = require('express-session');
const router = express.Router();
const dbo = require("../db/conn");

router.use(session({
    secret: 'hangman-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// This sets the username in the session
router.route('/setUsername').post((req, res) => {
    const { username } = req.body;
    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }
    req.session.username = username;
    req.session.guesses = 0;
    console.log('Session set:', req.session);
    res.json({ message: `Username ${username} has been set` });
});

// This route increments the number of guesses in the session
router.route('/incrementGuess').post((req, res) => {
    if (!req.session.username) {
        return res.status(400).json({ error: 'Username not set in session' });
    }
    req.session.guesses = (req.session.guesses || 0) + 1;
    console.log('Incremented guesses:', req.session.guesses);
    res.json({ guesses: req.session.guesses });
});

// This routes gets highscores with a given word length
router.route('/highScores/:wordLength').get(async (req, res) => {
    try {
        const wordLength = parseInt(req.params.wordLength);
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Players");
        const highScores = await collection.find({ wordLength })
            .sort({ score: 1 })
            .limit(10)
            .toArray();
        console.log('High Scores:', highScores);
        res.json(highScores);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// This route saves the score
router.route('/saveScore').post(async (req, res) => {
    try {
        console.log('Request to save score:', req.body);
        const { username, score, wordLength } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }
        if (typeof score !== 'number') {
            return res.status(400).json({ error: 'Invalid score format' });
        }
        if (typeof wordLength !== 'number') {
            return res.status(400).json({ error: 'Invalid word length format' });
        }
        const dbConnect = dbo.getDb();
        const collection = dbConnect.collection("Players");
        const playerDoc = {
            player: username,
            score: score,
            wordLength: wordLength
        };
        const result = await collection.insertOne(playerDoc);
        console.log('Score saved:', result.insertedId);
        res.json({ message: 'Score has been saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
