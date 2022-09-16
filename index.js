const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iay4ax7.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    try {
        await client.connect();
        const volunteersCollection = client.db('thegivingtree').collection('volunteers');
        const userCollection = client.db('thegivingtree').collection('users');
        const organizationsCollection = client.db('thegivingtree').collection('organizations');

        //Getting all voluteers info
        app.get('/volunteers', async (req, res) => {
            const query = {};
            const cursor = volunteersCollection.find(query);
            const tools = await cursor.toArray();
            res.send(tools);
        })
        //Getting all organisation info
        app.get('/organizations', async (req, res) => {
            const cursor = organizationsCollection.find();
            const tools = await cursor.toArray();
            res.send(tools);
        })
        // Storing user data in database
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24d' });
            res.send({ result, token });
        })
        // Storing volunteer data in database
        app.put('/volunteers/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await volunteersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24d' });
            res.send({ result, token });
        })
        // Updating individual valunteer data
        app.put('/volunteer/:email', async (req, res) => {
            const email = req.params.email;
            const updateProfile = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updateProfile,
            };
            const result = await volunteersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        // Storing volunteer data in database
        app.put('/organizations/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await organizationsCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '24d' });
            res.send({ result, token });
        })
        // Updating individual org data
        app.put('/organization/:email', async (req, res) => {
            const email = req.params.email;
            const updateProfile = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: updateProfile,
            };
            const result = await organizationsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

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