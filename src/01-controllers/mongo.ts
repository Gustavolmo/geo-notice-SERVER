// import { v4 as uuidv4 } from 'uuid';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv'
dotenv.config()

//===============
// MONGODB SETUP
//===============

const pw = process.env.MONGO_PW;
const uri = `mongodb+srv://gustavolmo:${pw}@logacluster.fpmn1bl.mongodb.net/?retryWrites=true&w=majority`;

const client: MongoClient = MongoClient(uri, {
  serverAPI: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useUndefinedTopology: true,
  },
});

async function closeConnection() {
  console.log('Disconnecting...');
  try {
    await client.close();
    console.log('Disconnected');
  } catch (err) {
    throw new Error(err);
  } finally {
    process.exit();
  }
}

export async function runMongoDb() {
  try {
    await client.connect();
    process.on('SIGTERM', closeConnection);
    process.on('SIGINT', closeConnection);
  } catch (err) {
    throw new Error(err);
  }
}

runMongoDb()

//=============
// CONTROLLERS
//=============

export const createNewChat = async (chatData: any)  => {
  try {
    const collection = client.db('geo-notice').collection('chats');
    await collection.insertOne(chatData);
  } catch (err) {
    console.log(err);
  }
};

export const getAllChat = async (id) => {
  const collection = client.db('geo-notice').collection('chats');
  return await collection.find({id: id}).toArray()
};

//=============
// AI MODERATOR
//=============

const key = process.env.OPEN_AI_KEY
const url = 'https://api.openai.com/v1/moderations'
export const moderationAI = async (text: string) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json',
    'Authorization': `Bearer ${key}`, },
    body: JSON.stringify({"input": text}),
  });
  const resAsJson = await res.json();
  return resAsJson;
}

export default {
  runMongoDb
};