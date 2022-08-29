const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iay4ax7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        console.log('DB Connected');
    }
    finally {

    }
}

run().catch(console.dir);

// ROOT API
app.get('/', (req, res) => {
    res.send('The Giving Tree server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})