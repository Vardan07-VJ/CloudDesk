import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './prisma/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.send('Server is up and running');
});

// GET all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await db.orm.public.Ticket.all();

    res.json(tickets);
  } catch (error) {
    console.error('Failed to get tickets:', error);

    res.status(500).json({
      message: 'Failed to get tickets',
    });
  }
});

// CREATE a ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !description || !priority) {
      return res.status(400).json({
        message: 'Title, description and priority are required',
      });
    }

    const ticket = await db.orm.public.Ticket.create({
      title,
      description,
      priority,
      status: 'Open',
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error('Failed to create ticket:', error);

    res.status(500).json({
      message: 'Failed to create ticket',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});