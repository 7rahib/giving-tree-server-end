const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectId;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


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
        const emergencyReliefsCollection = client.db('thegivingtree').collection('emergencyReliefs');
        const donationsCollection = client.db('thegivingtree').collection('donations');
        const upazillaCollection = client.db('thegivingtree').collection('upazillas');
        const upazillaDonationCollection = client.db('thegivingtree').collection('upazillaDonations');

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



        // Running emergency reliefs


        // All Running emergency relief information
        app.get('/emergencyrelief', async (req, res) => {
            const emergencyreliefs = await emergencyReliefsCollection.find().toArray();
            res.send(emergencyreliefs);
        })


        // Adding new emergency relief
        app.post("/emergencyrelief", async (req, res) => {
            const query = req.body;
            const emergencyrelief = await emergencyReliefsCollection.insertOne(query);
            res.send(emergencyrelief);
        });


        // Getting individually added emergency reliefs by email
        app.get('/emergencyrelief/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const emergencyreliefs = await emergencyReliefsCollection.find(query).toArray();
            res.send(emergencyreliefs)
        });


        // Getting all added emergency reliefs by location
        app.get('/emergencyrelief/:location', async (req, res) => {
            const location = req.params.location
            const query = { location: location };
            const emergencyreliefs = await emergencyReliefsCollection.findOne(query)
            res.send(emergencyreliefs)
        });

        // Getting individual emergency relief data
        app.get('/emergencyreliefs/:_id', async (req, res) => {
            const _id = req.params._id
            const query = { _id: ObjectId(_id) }
            const emergencyreliefs = await emergencyReliefsCollection.findOne(query)
            res.send(emergencyreliefs)
        })


        // Delete single emergency reliefs based on id
        app.delete('/emergencyrelief/:_id', async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const result = await emergencyReliefsCollection.deleteOne(filter);
            res.send(result);
        })

        // Assigning approve status on a Relief
        app.put('/emergencyrelief/:_id', verifyJWT, async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const updateDoc = {
                $set: { status: 'approved' },
            };
            const result = await emergencyReliefsCollection.updateOne(filter, updateDoc);
            res.send(result);
        })


        // Running emergency reliefs end


        // User Details


        // All users information
        app.get('/users', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        // Getting individually of individual users by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email };
            const emergencyreliefs = await userCollection.find(query).toArray();
            res.send(emergencyreliefs)
        });

        // Assign Admin role
        app.put('/user/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Checking which user has admin role
        app.get('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            res.send({ admin: isAdmin })
        })

        // Deleting Users
        app.delete('/users/:_id', verifyJWT, async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const result = await userCollection.deleteOne(filter);
            res.send(result);
        })

        // User Details Ends


        // Donation
        app.post('/donations', async (req, res) => {
            const payment = req.body;
            const result = await donationsCollection.insertOne(payment);
            res.send(result);
        })

        // Getting all donations of an user
        app.get('/donations/:email', async (req, res) => {
            const email = req.params.email
            const query = { donaterEmail: email }
            const personalDonations = await donationsCollection.find(query).toArray();
            res.send(personalDonations)
        })
        // Getting all donations
        app.get('/donations', async (req, res) => {
            const yourOrder = await donationsCollection.find().toArray()
            res.send(yourOrder)
        })

        // Donation Ends

        // Upazilla Data Testing

        // Getting all upazilla data
        app.get('/upazilla/:city', async (req, res) => {
            const city = req.params.city
            const query = { cityName: city }
            const result = await upazillaCollection.find(query).toArray()
            res.send(result)
        })

        // All Upazilla Donation data
        app.get('/upazilla', async (req, res) => {
            const result = await upazillaDonationCollection.find().toArray();
            res.send(result);
        })

        // Marking Upazillas Donation status
        app.put('/upazilla/:_id', verifyJWT, async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const updateDoc = {
                $set: { donation: 'Given' },
            };
            const result = await upazillaDonationCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        app.put('/upazillas/:_id', verifyJWT, async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const updateDoc = {
                $set: { donation: 'Not Given' },
            };
            const result = await upazillaDonationCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Add New Upazilla
        app.post('/upazilla', async (req, res) => {
            const upazilla = req.body;
            const result = await upazillaDonationCollection.insertOne(upazilla);
            res.send(result);
        })

        // Delete single upazilla based on id
        app.delete('/upazillas/:_id', async (req, res) => {
            const _id = req.params._id;
            const filter = { _id: ObjectId(_id) };
            const result = await upazillaDonationCollection.deleteOne(filter);
            res.send(result);
        })





        // Upazilla Data Testing End


        // Payment Intent

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = price * 100;
            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
            });
        });


        // Payment Intent Ends


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