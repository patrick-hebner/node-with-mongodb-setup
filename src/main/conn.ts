import { database, mongo_url } from "./config/env";
import { MongoClient } from "mongodb";

const connectionString = mongo_url;
console.log(">>> Connect to mongodb with ", connectionString);
const client = new MongoClient(connectionString);

const db = client.db(database);

export default db;
