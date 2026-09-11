import React, { useEffect, useMemo, useState } from 'react';

import TicketCard from '../components/TicketCard';
import CreateTicketForm from '../components/CreateTicketForm';

import type { Ticket } from '../types/Ticket';

const API_URL = 'http://localhost:5000/api/tickets';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tickets from the database
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error('Failed to load tickets');
        }

        const data: Ticket[] = await response.json();

        setTickets(data);
      } catch (err) {
        console.error(err);
        setError('Could not load tickets.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Create ticket
  const handleCreateTicket = async (
    ticketData: Omit<
      Ticket,
      'id' | 'createdAt' | 'status' | 'assignee'
    >
  ) => {
    try {
      setError('');

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ticketData),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const newTicket: Ticket = await response.json();

      setTickets((currentTickets) => [
        newTicket,
        ...currentTickets,
      ]);

      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
      setError('Could not create ticket.');
    }
  };

  // Update ticket in UI after status change
  const handleStatusChange = (updatedTicket: Ticket) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id
          ? updatedTicket
          : ticket
      )
    );
  };

  // Remove deleted ticket from UI
  const handleDelete = (ticketId: number) => {
    setTickets((currentTickets) =>
      currentTickets.filter(
        (ticket) => ticket.id !== ticketId
      )
    );
  };

  // Search, filter and sort tickets
  const filteredTickets = useMemo(() => {
    const statusOrder: Record<string, number> = {
      Open: 1,
      'In Progress': 2,
      Resolved: 3,
    };

    return tickets
      .filter((ticket) => {
        const search = searchTerm.toLowerCase();

        const matchesSearch =
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search) ||
          ticket.category.toLowerCase().includes(search) ||
          ticket.requester.toLowerCase().includes(search) ||
          (ticket.assignee
            ?.toLowerCase()
            .includes(search) ??
            false);

        const matchesStatus =
          statusFilter === 'All' ||
          ticket.status === statusFilter;

        const matchesPriority =
          priorityFilter === 'All' ||
          ticket.priority === priorityFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority
        );
      })
      .sort((a, b) => {
        // Open first, In Progress second, Resolved last
        const statusDifference =
          statusOrder[a.status] -
          statusOrder[b.status];

        if (statusDifference !== 0) {
          return statusDifference;
        }

        // Within the same status, newest ticket first
        return (
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
        );
      });
  }, [
    tickets,
    searchTerm,
    statusFilter,
    priorityFilter,
  ]);

  return (
    <div className="dashboard">
      <h1>CloudDesk Tickets</h1>

      <div className="ticket-controls">
        <input
          type="text"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">
            In Progress
          </option>
          <option value="Resolved">
            Resolved
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value)
          }
        >
          <option value="All">
            All Priorities
          </option>
          <option value="Low">Low</option>
          <option value="Medium">
            Medium
          </option>
          <option value="High">High</option>
        </select>

        <button
          type="button"
          onClick={() =>
            setShowCreateForm((current) => !current)
          }
        >
          {showCreateForm
            ? 'Cancel'
            : 'Create Ticket'}
        </button>
      </div>

      {showCreateForm && (
        <CreateTicketForm
          onSubmit={handleCreateTicket}
        />
      )}

      {error && <p>{error}</p>}

      {loading ? (
        <p>Loading tickets...</p>
      ) : (
        <div className="ticket-list">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <p>No tickets found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Tickets;