import express, { Application } from 'express';
import {
  createNewChat,
  getAllChat,
  moderationAI,
  runMongoDb,
} from './01-controllers/mongo';
import cors from 'cors';

const app: Application = express();
const port = 4000;
app.use(express.json());
app.use(cors());

runMongoDb();

app.get('/api/chat/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const allChat = await getAllChat(id);
    res.status(200).send(allChat);
  } catch (err) {
    console.error({ '>>>> ERROR MESSAGE <<<< ': err });
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    const chatData = req.body;
    const moderationFlag = await moderationAI(chatData[0].content);
    const policyInfringment = moderationFlag.results[0].flagged;
    const infringmentCategories = moderationFlag.results[0].categories;

    if (policyInfringment) {
      const flaggedContent = Object.keys(infringmentCategories)
        .filter((category) => infringmentCategories[category])
        .join(', ');

      res.status(200).send({ message: flaggedContent });
    } else {
      await createNewChat(chatData[0]);
      res.status(201).send({ message: 'success' });
    }
  } catch (err) {
    console.error({ '>>>> ERROR MESSAGE <<<< ': err });
  }
});

app.listen(port, () => {
  console.log(`\nAPP ENAGED ON PORT ${port} (o.o)\n`);
});
