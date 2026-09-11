import React, { useEffect, useMemo, useState } from 'react';

import TicketCard from '../components/TicketCard';
import CreateTicketForm from '../components/CreateTicketForm';
import type { Ticket } from '../types/Ticket';

const API_URL = 'http://localhost:5000/api/tickets';

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicketId, setSelectedTicketId] =
    useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==============================
  // LOAD TICKETS
  // ==============================

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

        if (data.length > 0) {
          setSelectedTicketId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load tickets:', err);
        setError('Could not load tickets.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // ==============================
  // CREATE TICKET
  // ==============================

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

      setSelectedTicketId(newTicket.id);
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setError('Could not create ticket.');
    }
  };

  // ==============================
  // UPDATE TICKET
  // ==============================

  const handleTicketUpdate = (
    updatedTicket: Ticket
  ) => {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === updatedTicket.id
          ? updatedTicket
          : ticket
      )
    );
  };

  // ==============================
  // DELETE TICKET
  // ==============================

  const handleDelete = (ticketId: number) => {
    setTickets((currentTickets) => {
      const remainingTickets =
        currentTickets.filter(
          (ticket) => ticket.id !== ticketId
        );

      if (selectedTicketId === ticketId) {
        setSelectedTicketId(
          remainingTickets.length > 0
            ? remainingTickets[0].id
            : null
        );
      }

      return remainingTickets;
    });
  };

  // ==============================
  // DYNAMIC STATS
  // ==============================

  const stats = useMemo(() => {
    const open = tickets.filter(
      (ticket) => ticket.status === 'Open'
    ).length;

    const inProgress = tickets.filter(
      (ticket) =>
        ticket.status === 'In Progress'
    ).length;

    const resolved = tickets.filter(
      (ticket) => ticket.status === 'Resolved'
    ).length;

    return {
      total: tickets.length,
      open,
      inProgress,
      resolved,
    };
  }, [tickets]);

  // ==============================
  // FILTER + SORT
  // ==============================

  const filteredTickets = useMemo(() => {
    const search =
      searchTerm.trim().toLowerCase();

    const statusOrder: Record<string, number> = {
      Open: 1,
      'In Progress': 2,
      Resolved: 3,
    };

    return tickets
      .filter((ticket) => {
        const matchesSearch =
          !search ||
          ticket.title
            .toLowerCase()
            .includes(search) ||
          ticket.description
            .toLowerCase()
            .includes(search) ||
          ticket.category
            .toLowerCase()
            .includes(search) ||
          ticket.requester
            .toLowerCase()
            .includes(search) ||
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
        const statusDifference =
          (statusOrder[a.status] ?? 99) -
          (statusOrder[b.status] ?? 99);

        if (statusDifference !== 0) {
          return statusDifference;
        }

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

  // ==============================
  // SELECTED TICKET
  // ==============================

  const selectedTicket =
    tickets.find(
      (ticket) =>
        ticket.id === selectedTicketId
    ) ?? null;

  const getStatusSymbol = (status: string) => {
    if (status === 'Resolved') {
      return '✓';
    }

    if (status === 'In Progress') {
      return '◐';
    }

    return '●';
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <main className="tickets-page">
        <p>Loading tickets...</p>
      </main>
    );
  }

  return (
    <main className="tickets-page">
      {/* HEADER */}

      <header className="tickets-header">
        <div>
          <p className="eyebrow">
            CLOUDDESK SERVICE DESK
          </p>

          <h1>Tickets</h1>

          <p className="page-subtitle">
            Manage, assign and resolve support
            requests.
          </p>
        </div>

        <button
          type="button"
          className="new-ticket-button"
          onClick={() =>
            setShowCreateForm(
              (current) => !current
            )
          }
        >
          {showCreateForm
            ? 'Close Form'
            : '+ New Ticket'}
        </button>
      </header>

      {/* DYNAMIC STATS */}

      <section className="ticket-stats">
        <div className="ticket-stat">
          <span>Total Tickets</span>
          <strong>{stats.total}</strong>
        </div>

        <div className="ticket-stat stat-open">
          <span>Open</span>
          <strong>{stats.open}</strong>
        </div>

        <div className="ticket-stat stat-progress">
          <span>In Progress</span>
          <strong>{stats.inProgress}</strong>
        </div>

        <div className="ticket-stat stat-resolved">
          <span>Resolved</span>
          <strong>{stats.resolved}</strong>
        </div>
      </section>

      {/* CREATE FORM */}

      {showCreateForm && (
        <section className="create-ticket-panel">
          <div className="section-heading">
            <p className="eyebrow">
              NEW SUPPORT REQUEST
            </p>

            <h2>Create Ticket</h2>
          </div>

          <CreateTicketForm
            onSubmit={handleCreateTicket}
          />
        </section>
      )}

      {error && (
        <p className="page-error">
          {error}
        </p>
      )}

      {/* SEARCH + FILTERS */}

      <section className="ticket-toolbar">
        <input
          type="search"
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
        />

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="All">
            All Statuses
          </option>

          <option value="Open">
            Open
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Resolved">
            Resolved
          </option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(
              event.target.value
            )
          }
        >
          <option value="All">
            All Priorities
          </option>

          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>
        </select>
      </section>

      {/* MAIN HELPDESK */}

      <section className="helpdesk-workspace">
        {/* LEFT QUEUE */}

        <aside className="ticket-queue">
          <div className="queue-header">
            <div>
              <p className="eyebrow">
                TICKET QUEUE
              </p>

              <h2>Support Requests</h2>
            </div>

            <span className="queue-count">
              {filteredTickets.length}
            </span>
          </div>

          <div className="queue-list">
            {filteredTickets.length > 0 ? (
              filteredTickets.map(
                (ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    className={`queue-ticket ${
                      selectedTicketId ===
                      ticket.id
                        ? 'queue-ticket-active'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedTicketId(
                        ticket.id
                      )
                    }
                  >
                    <div className="queue-ticket-top">
                      <span
                        className={`queue-status status-${ticket.status
                          .toLowerCase()
                          .replace(
                            /\s+/g,
                            '-'
                          )}`}
                      >
                        {getStatusSymbol(
                          ticket.status
                        )}
                      </span>

                      <span className="queue-ticket-id">
                        #{ticket.id}
                      </span>

                      <span
                        className={`queue-priority priority-${ticket.priority.toLowerCase()}`}
                      >
                        {ticket.priority}
                      </span>
                    </div>

                    <strong className="queue-ticket-title">
                      {ticket.title}
                    </strong>

                    <p className="queue-ticket-description">
                      {ticket.description}
                    </p>

                    <div className="queue-ticket-footer">
                      <span>
                        {ticket.category}
                      </span>

                      <span>
                        {ticket.assignee ||
                          'Unassigned'}
                      </span>
                    </div>
                  </button>
                )
              )
            ) : (
              <div className="empty-queue">
                <strong>
                  No tickets found
                </strong>

                <p>
                  Change your search or
                  filters.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT WORKSPACE */}

        <section className="ticket-detail-pane">
          {selectedTicket ? (
            <>
              <div className="detail-pane-heading">
                <div>
                  <p className="eyebrow">
                    TICKET #
                    {selectedTicket.id}
                  </p>

                  <h2>
                    {selectedTicket.title}
                  </h2>
                </div>

                <span
                  className={`detail-priority priority-${selectedTicket.priority.toLowerCase()}`}
                >
                  {selectedTicket.priority}{' '}
                  PRIORITY
                </span>
              </div>

              <TicketCard
                key={selectedTicket.id}
                ticket={selectedTicket}
                onStatusChange={
                  handleTicketUpdate
                }
                onDelete={handleDelete}
              />
            </>
          ) : (
            <div className="empty-detail">
              <div className="empty-detail-icon">
                ☁
              </div>

              <h2>
                Select a ticket
              </h2>

              <p>
                Choose a support request
                from the queue to manage it.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default Tickets;