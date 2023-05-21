const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const cors = require('cors')
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qpfli06.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();

        const gacCollection = client.db('gacData').collection('gac')

        // find all data from mongoDb
        app.get('/allgacdata', async (req, res) => {
            const result = await gacCollection.find().toArray();
            res.send(result)
        })

        // Sorting All Sub Category data
        app.get('/allgacdata/:text', async (req, res) => {
            if (req.params.text == 'sports' || req.params.text == 'truck' || req.params.text == 'police') {
                const result = await gacCollection.find({ category: req.params.text }).toArray();
                return res.send(result)
            }
        })

        // for view details unique id
        app.get('/viewing/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const user = await gacCollection.findOne(query);
            res.send(user)
        })

        // for update data unique id
        app.put('/viewing/:id', async (req, res) => {
            const id = req.params.id;
            const update = req.body;
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updated = {
                $set: {
                    price: update.price,
                    quantity: update.quantity,
                    description: update.description
                }
            }
            const result = await gacCollection.updateOne(query, updated, options);
            res.send(result)
        })

        // for "my toys" router
        app.get("/mygacdata/:email", async (req, res) => {
            const gacs = await gacCollection
                .find({
                    email: req.params.email,
                })
                .toArray();
            res.send(gacs);
        });


        // for all data post in mongoDb
        app.post('/allgacdata', async (req, res) => {
            const user = req.body;
            const result = await gacCollection.insertOne(user)
            res.send(result)
        })

        // delete from client side data
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await gacCollection.deleteOne(query);
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
    res.send('Server is running')
})

app.listen(port, () => {
    console.log(`port is running on ${port}`)
})