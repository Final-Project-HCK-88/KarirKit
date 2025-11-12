import { MongoClient } from 'mongodb';
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mydatabase';
const client = new MongoClient(uri);
export const database = client.db("KarirKitDB");