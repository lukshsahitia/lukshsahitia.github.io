const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.ATLAS_URI;

let _db;

module.exports = {
    connectToServer: function (callback) {
        console.log('Connecting to MongoDB...');
        const client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
        async function run() {
            try {
                await client.connect();
                await client.db("admin").command({ ping: 1 });
                console.log("Pinged your deployment. You successfully connected to MongoDB!");
                _db = client.db("Hangman");
                console.log("Successfully connected to Hangman collection!");
            } finally {
                callback();
            }
        }
        run().catch(console.dir);
    },

    getDb: function () {
        return _db;
    }
}
// Connection string for the .env file: mongodb+srv://<username>:<password>@cluster0.khoibwm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
// Connection string for adding onto extension: mongodb+srv://<username>:<password>@cluster0.khoibwm.mongodb.net/ 