import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './prisma/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==============================
// HEALTH CHECK
// ==============================

app.get('/api/health', (req, res) => {
  res.send('Server is up and running');
});

// ==============================
// TICKETS
// ==============================

// Get all tickets
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

// Create ticket
app.post('/api/tickets', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      requester,
    } = req.body;

    if (
      !title ||
      !description ||
      !category ||
      !priority ||
      !requester
    ) {
      return res.status(400).json({
        message:
          'Title, description, category, priority and requester are required',
      });
    }

    const ticket = await db.orm.public.Ticket.create({
      title: title.trim(),
      description: description.trim(),
      category,
      priority,
      requester: requester.trim(),
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

// Update ticket status
app.patch('/api/tickets/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'Invalid ticket id',
      });
    }

    const allowedStatuses = [
      'Open',
      'In Progress',
      'Resolved',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid ticket status',
      });
    }

    const updatedTicket = await db.orm.public.Ticket
      .where({ id })
      .update({ status });

    if (!updatedTicket) {
      return res.status(404).json({
        message: 'Ticket not found',
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Failed to update ticket:', error);

    res.status(500).json({
      message: 'Failed to update ticket',
    });
  }
});

// Assign or unassign technician
app.patch('/api/tickets/:id/assignee', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { assignee } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'Invalid ticket id',
      });
    }

    if (
      assignee !== null &&
      typeof assignee !== 'string'
    ) {
      return res.status(400).json({
        message: 'Invalid assignee',
      });
    }

    const cleanedAssignee =
      typeof assignee === 'string' && assignee.trim()
        ? assignee.trim()
        : null;

    const updatedTicket = await db.orm.public.Ticket
      .where({ id })
      .update({
        assignee: cleanedAssignee,
      });

    if (!updatedTicket) {
      return res.status(404).json({
        message: 'Ticket not found',
      });
    }

    res.json(updatedTicket);
  } catch (error) {
    console.error('Failed to assign ticket:', error);

    res.status(500).json({
      message: 'Failed to assign ticket',
    });
  }
});

// Delete ticket
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        message: 'Invalid ticket id',
      });
    }

    const deletedTicket = await db.orm.public.Ticket
      .where({ id })
      .delete();

    if (!deletedTicket) {
      return res.status(404).json({
        message: 'Ticket not found',
      });
    }

    res.json({
      message: 'Ticket deleted successfully',
      ticket: deletedTicket,
    });
  } catch (error) {
    console.error('Failed to delete ticket:', error);

    res.status(500).json({
      message: 'Failed to delete ticket',
    });
  }
});

// ==============================
// COMMENTS / ACTIVITY
// ==============================

// Get comments for a specific ticket
app.get('/api/tickets/:id/comments', async (req, res) => {
  try {
    const ticketId = Number(req.params.id);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        message: 'Invalid ticket id',
      });
    }

    const comments = await db.orm.public.Comment
      .where({ ticketId })
      .all();

    res.json(comments);
  } catch (error) {
    console.error('Failed to get comments:', error);

    res.status(500).json({
      message: 'Failed to get comments',
    });
  }
});

// Add comment to a ticket
app.post('/api/tickets/:id/comments', async (req, res) => {
  try {
    const ticketId = Number(req.params.id);
    const { author, message } = req.body;

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        message: 'Invalid ticket id',
      });
    }

    if (
      typeof author !== 'string' ||
      !author.trim() ||
      typeof message !== 'string' ||
      !message.trim()
    ) {
      return res.status(400).json({
        message: 'Author and message are required',
      });
    }

    const comment = await db.orm.public.Comment.create({
      ticketId,
      author: author.trim(),
      message: message.trim(),
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Failed to create comment:', error);

    res.status(500).json({
      message: 'Failed to create comment',
    });
  }
});

// ==============================
// START SERVER
// ==============================

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});