# ☁️ CloudDesk

**CloudDesk** is a full-stack IT helpdesk and ticket management application designed to simulate a real-world internal service desk workflow.

Users can create support requests, categorize and prioritize issues, assign technicians, update ticket status, maintain an activity history through comments, search and filter tickets, and monitor support workload through a live dashboard.

The application uses a cloud-hosted PostgreSQL database, so ticket information and activity remain persistent across browser sessions.

---

## 🚀 Tech Stack

### Frontend
- React
- TypeScript
- Vite
- CSS
- Fetch API

### Backend
- Node.js
- Express
- TypeScript
- REST API

### Database
- PostgreSQL
- Neon PostgreSQL
- Prisma ORM

### Development Tools
- Git
- GitHub
- VS Code
- npm

---

## ✨ Features

### 🎫 Ticket Management

CloudDesk supports the core lifecycle of an IT support request.

Users can:

- Create support tickets
- Add requester information
- Add detailed issue descriptions
- Categorize tickets
- Set ticket priority
- View the complete ticket queue
- Delete tickets

Available categories include:

- Hardware
- Software
- Network
- Account / Access
- Email
- Other

---

### 🔄 Ticket Workflow

Tickets can move through three support states:

```text
Open → In Progress → Resolved
```

Status changes are saved to the PostgreSQL database and immediately reflected throughout the interface.

---

### 👨‍💻 Technician Assignment

Support tickets can be assigned to technicians.

CloudDesk supports:

- Assigning a technician
- Updating an assignment
- Removing an assignment
- Displaying assigned technicians directly in the ticket queue

Assignment changes persist in the database.

---

### 💬 Ticket Activity & Comments

Each ticket contains its own activity history.

Support staff can:

- Add updates to a ticket
- Record the author of an update
- View previous activity
- View timestamps
- Maintain activity across browser refreshes

This provides a simple support history for each issue.

---

### 🔎 Search & Filtering

The ticket queue can be searched using information such as:

- Ticket title
- Description
- Category
- Requester
- Assigned technician

Tickets can also be filtered by:

- Status
- Priority

---

### 📊 Dynamic Dashboard

CloudDesk includes a dashboard that calculates ticket statistics from live database data.

The dashboard displays:

- Total Tickets
- Open Tickets
- In Progress Tickets
- Resolved Tickets
- Recent Tickets

When ticket data changes, the dashboard reflects the current state of the helpdesk.

---

### 🗄️ Persistent Cloud Database

CloudDesk uses PostgreSQL hosted on Neon.

Data is stored outside the React application, meaning tickets are not lost when the browser refreshes.

Persistent information includes:

- Tickets
- Status
- Priority
- Categories
- Requesters
- Technician assignments
- Comments
- Timestamps

---

## 🏗️ Architecture

CloudDesk follows a full-stack client/server architecture:

```text
┌──────────────────────────────┐
│      React + TypeScript      │
│          Frontend            │
└──────────────┬───────────────┘
               │
               │ HTTP / JSON
               │
               ▼
┌──────────────────────────────┐
│    Node.js + Express API     │
│           Backend            │
└──────────────┬───────────────┘
               │
               │ Prisma ORM
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
│        Hosted on Neon        │
└──────────────────────────────┘
```

The frontend communicates with the Express REST API.

The backend validates requests and uses Prisma to communicate with PostgreSQL.

The database acts as the persistent source of ticket and activity data.

---

## 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Checks whether the backend server is running.

### Get Tickets

```http
GET /api/tickets
```

Returns all support tickets.

### Create Ticket

```http
POST /api/tickets
```

Creates a new support ticket.

### Update Ticket Status

```http
PATCH /api/tickets/:id/status
```

Changes a ticket between:

- Open
- In Progress
- Resolved

### Assign Technician

```http
PATCH /api/tickets/:id/assignee
```

Assigns, changes, or removes the technician responsible for a ticket.

### Delete Ticket

```http
DELETE /api/tickets/:id
```

Deletes a ticket.

### Get Ticket Activity

```http
GET /api/tickets/:id/comments
```

Returns the activity/comments associated with a ticket.

### Add Ticket Activity

```http
POST /api/tickets/:id/comments
```

Adds a new activity update to a ticket.

---

## 📁 Project Structure

```text
CloudDesk/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── prisma/
│   │   └── index.ts
│   │
│   ├── prisma.config.ts
│   └── package.json
│
└── README.md
```

---

## ⚙️ Running CloudDesk Locally

### Prerequisites

Install:

- Node.js
- npm
- Git

You will also need access to a PostgreSQL database.

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CloudDesk
```

---

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

### 4. Configure Environment Variables

Create:

```text
server/.env
```

Add your PostgreSQL connection string:

```env
DATABASE_URL="your-postgresql-connection-string"
```

> Never commit `.env` files or database credentials to GitHub.

---

### 5. Start the Backend

From the `server` directory:

```bash
npm run dev
```

The API runs locally on:

```text
http://localhost:5000
```

---

### 6. Start the Frontend

Open another terminal:

```bash
cd client
npm run dev
```

The frontend runs locally on:

```text
http://localhost:5173
```

---

## 🔐 Security

Database credentials are stored using environment variables rather than being hardcoded into the application.

The `.env` file is excluded from Git using `.gitignore`.

A public repository should never contain production database credentials.

---

## 🎯 Why I Built CloudDesk

I built CloudDesk to strengthen my understanding of how a real full-stack application works beyond the user interface.

The project gave me hands-on experience connecting:

- React interfaces
- TypeScript
- REST APIs
- Express backend development
- Database persistence
- PostgreSQL
- Prisma ORM
- Cloud-hosted databases
- CRUD operations
- Git version control

It also allowed me to model a workflow similar to the tools used by IT support and service desk teams.

---

## 🧠 What I Learned

Building CloudDesk involved solving problems across the entire application stack, including:

- Connecting a React frontend to an Express backend
- Designing REST API endpoints
- Persisting application data in PostgreSQL
- Integrating Prisma with a cloud database
- Managing asynchronous API requests
- Synchronizing frontend state with backend data
- Designing ticket lifecycle workflows
- Handling technician assignments
- Building persistent ticket activity
- Debugging TypeScript and configuration issues
- Protecting environment variables and credentials
- Structuring a full-stack project for version control

---

## 🛣️ Future Improvements

CloudDesk is designed so additional service desk functionality can be added later.

Potential future improvements include:

- Authentication and role-based access
- User accounts
- Asset management
- Location/store management
- Email notifications
- File attachments
- SLA tracking
- Advanced analytics
- AI-assisted ticket categorization
- Automated ticket summaries

---

## 👤 Author

**Vardan**

Software Development graduate focused on full-stack development, IT systems, technical support, and practical software solutions.