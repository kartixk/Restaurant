const dns = require('dns');
dns.setServers(['8.8.8.8']);
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://kartikeyaa15_db_user:Kartik%4015@kartikeya.1psrnv.mongodb.net/sweetshop?retryWrites=true&w=majority&appName=Kartikeya";

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db("sweetshop");
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
    } catch (err) {
        console.error("Connection failed:", err);
    } finally {
        await client.close();
    }
}

run();
