const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()

// Middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ycg9h6w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const carServicesCollection = client.db('carDoctor').collection('services')
        const bookingCollection = client.db('carDoctor').collection('bookings')
        // Get Data from Database 
        app.get('/services',async(req,res)=>{
            // const data = req.body 
            const result = await carServicesCollection.find().toArray()
            res.send(result)
        })
        // Get specific data from database 
        app.get('/services/:id', async(req,res)=>{
            const id = req.params.id 
            const query = {_id : new ObjectId(id)}
            const result = await carServicesCollection.findOne(query)
            res.send(result)
        })
        //bookings api 
        app.post('/bookings',async(req,res)=>{
            const booking = req.body 
            const result = await bookingCollection.insertOne(req.body)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Hello World")
})

app.listen(port, () => {
    console.log("App is running from Port: ", port);
})