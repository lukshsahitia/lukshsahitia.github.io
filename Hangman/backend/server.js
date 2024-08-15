const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config.env" });

const app = express();

app.use(cors());
app.use(express.json());

const dbo = require("./db/conn");
const hangmanRoute = require("./routes/hangmanRoute");
const sessionRoute = require("./routes/sessions");

const port = 4000;

app.use('/', hangmanRoute);
app.use('/session', sessionRoute);

app.listen(port, () => {
    dbo.connectToServer(function (err) {
        if (err) console.error(err);
    });
    console.log(`Server is running on port ${port}`);
});
