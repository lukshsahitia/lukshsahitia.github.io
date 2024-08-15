const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config({ path: "./config.env" });

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

const dbo = require("./db/conn");
const bankRoute = require("./routes/bankRoutes");
const sessionRoute = require("./routes/sessions");

const port = process.env.PORT || 4000;

app.use('/session', sessionRoute);
app.use('/', bankRoute);

app.listen(port, () => {
    dbo.connectToServer((err) => {
        if (err) console.error(err);
        else console.log("Successfully connected to MongoDB");
    });
    console.log(`Server is running on port ${port}`);
});