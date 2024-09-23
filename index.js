const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;
const app = express()

// Middleware 
app.use(cors({
    origin:['http://localhost:5173'],
    credentials:true
}))
app.use(express.json())
app.use(cookieParser())


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
        // User related api 
        app.post('/jwt', async(req,res)=>{
            const user = req.body 
            const token = jwt.sign({user},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
            res
            .cookie('token', token,{
                httpOnly:true,
                secure:false,
                sameSite:'none'
            })
            .send({success:true})
        })

        //Service related api
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
        // Get booking specific data using email 
        // app.get('/booking/:email',async(req,res)=>{
        //     const token = req.cookies.token;
        //     console.log(token);
        //     const email = req.params.email 
        //     const query = {email : email}
        //     const result = await bookingCollection.find(query).toArray()
        //     res.send(result)
        // })
        // Get Booking data with email 
        app.get('/bookings', async(req,res)=>{
            const token = req?.cookies?.token;
            console.log(token);
            let query = {};
            if(req.query?.email){
                query = {email : req.query.email}
            }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })
        // Delete booking data api 
        app.delete('/booking/:id',async(req,res)=>{
            const id = req.params.id 
            const query = {_id: new ObjectId(id)}
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })
        // Update Booking Data 
        app.patch('/booking/:id', async(req,res)=>{
            const id = req.params.id 
            const filter = {_id : new ObjectId(id)}
            const updatedBooking = req.body
            console.log(updatedBooking);
            const updateDoc = {
                $set: {
                  status:updatedBooking.status,
                },
              };
              const result = await bookingCollection.updateOne(filter, updateDoc);
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