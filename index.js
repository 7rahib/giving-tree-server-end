const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ROOT API
app.get('/', (req, res) => {
    res.send('The Giving Tree server is running')
})

app.listen(port, () => {
    console.log('Listening to ', port)
})