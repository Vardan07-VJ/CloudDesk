import React, { useEffect, useMemo, useState } from 'react';
import type { Ticket } from '../types/Ticket';
import './Dashboard.css';

const API_URL = 'http://localhost:5000/api/tickets';

const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load real tickets from the API
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
        console.error('Failed to load dashboard:', err);
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, []);

  // Calculate real dashboard statistics
  const summaryData = useMemo(() => {
    const openTickets = tickets.filter(
      (ticket) => ticket.status === 'Open'
    ).length;

    const inProgressTickets = tickets.filter(
      (ticket) => ticket.status === 'In Progress'
    ).length;

    const resolvedTickets = tickets.filter(
      (ticket) => ticket.status === 'Resolved'
    ).length;

    return [
      {
        title: 'Total Tickets',
        value: tickets.length,
      },
      {
        title: 'Open Tickets',
        value: openTickets,
      },
      {
        title: 'In Progress',
        value: inProgressTickets,
      },
      {
        title: 'Resolved',
        value: resolvedTickets,
      },
    ];
  }, [tickets]);

  // Show the 5 newest tickets
  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [tickets]);

  if (loading) {
    return (
      <div className="dashboard">
        <h1>CloudDesk Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <h1>CloudDesk Dashboard</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>CloudDesk Dashboard</h1>

      <div className="summary-cards">
        {summaryData.map((data) => (
          <div key={data.title} className="card">
            <h2>{data.title}</h2>
            <p>{data.value}</p>
          </div>
        ))}
      </div>

      <div className="recent-tickets">
        <h2>Recent Tickets</h2>

        {recentTickets.length > 0 ? (
          <ul>
            {recentTickets.map((ticket) => (
              <li
                key={ticket.id}
                className={`ticket ${ticket.status
                  .toLowerCase()
                  .replace(/\s+/g, '-')}`}
              >
                <h3>{ticket.title}</h3>

                <p>
                  Priority: {ticket.priority}
                </p>

                <p>
                  Status: {ticket.status}
                </p>

                <p>
                  Created:{' '}
                  {new Date(
                    ticket.createdAt
                  ).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No tickets yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;