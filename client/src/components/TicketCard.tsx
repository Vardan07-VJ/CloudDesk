import React, { useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';
import type { Ticket } from '../types/Ticket';

interface Comment {
  id: number;
  ticketId: number;
  author: string;
  message: string;
  createdAt: string;
}

interface TicketCardProps {
  ticket: Ticket;
  onStatusChange: (updatedTicket: Ticket) => void;
  onDelete: (ticketId: number) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  onStatusChange,
  onDelete,
}) => {
  const [assignee, setAssignee] = useState(
    ticket.assignee ?? ''
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentMessage, setCommentMessage] = useState('');

  const [loadingComments, setLoadingComments] =
    useState(true);

  const [addingComment, setAddingComment] =
    useState(false);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [updatingAssignee, setUpdatingAssignee] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [commentError, setCommentError] =
    useState('');

  // ==========================================
  // SYNC ASSIGNEE
  // ==========================================

  useEffect(() => {
    setAssignee(ticket.assignee ?? '');
  }, [ticket.assignee]);

  // ==========================================
  // LOAD COMMENTS
  // ==========================================

  useEffect(() => {
    const loadComments = async () => {
      try {
        setLoadingComments(true);
        setCommentError('');

        const response = await fetch(
          `http://localhost:5000/api/tickets/${ticket.id}/comments`
        );

        if (!response.ok) {
          throw new Error(
            'Failed to load comments'
          );
        }

        const data: Comment[] =
          await response.json();

        const sortedComments = [...data].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
        );

        setComments(sortedComments);
      } catch (error) {
        console.error(
          'Failed to load comments:',
          error
        );

        setCommentError(
          'Could not load activity.'
        );
      } finally {
        setLoadingComments(false);
      }
    };

    loadComments();
  }, [ticket.id]);

  // ==========================================
  // STATUS
  // ==========================================

  const handleStatusChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newStatus = event.target.value;

    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket.id}/status`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update status'
        );
      }

      const updatedTicket: Ticket =
        await response.json();

      onStatusChange(updatedTicket);
    } catch (error) {
      console.error(
        'Failed to update status:',
        error
      );

      alert(
        'Could not update ticket status.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ==========================================
  // ASSIGN TECHNICIAN
  // ==========================================

  const handleAssigneeUpdate = async () => {
    try {
      setUpdatingAssignee(true);

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket.id}/assignee`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            assignee:
              assignee.trim() || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to update assignee'
        );
      }

      const updatedTicket: Ticket =
        await response.json();

      onStatusChange(updatedTicket);

      setAssignee(
        updatedTicket.assignee ?? ''
      );
    } catch (error) {
      console.error(
        'Failed to update assignee:',
        error
      );

      alert(
        'Could not update ticket assignment.'
      );
    } finally {
      setUpdatingAssignee(false);
    }
  };

  // ==========================================
  // UNASSIGN TECHNICIAN
  // ==========================================

  const handleUnassign = async () => {
    try {
      setUpdatingAssignee(true);

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket.id}/assignee`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            assignee: null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to unassign technician'
        );
      }

      const updatedTicket: Ticket =
        await response.json();

      onStatusChange(updatedTicket);

      setAssignee('');
    } catch (error) {
      console.error(
        'Failed to unassign:',
        error
      );

      alert(
        'Could not unassign technician.'
      );
    } finally {
      setUpdatingAssignee(false);
    }
  };

  // ==========================================
  // ADD COMMENT
  // ==========================================

  const handleAddComment = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    const author =
      commentAuthor.trim();

    const message =
      commentMessage.trim();

    if (!author || !message) {
      setCommentError(
        'Your name and update are required.'
      );

      return;
    }

    try {
      setAddingComment(true);
      setCommentError('');

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket.id}/comments`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            author,
            message,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to add comment'
        );
      }

      const newComment: Comment =
        await response.json();

      setComments(
        (currentComments) => [
          ...currentComments,
          newComment,
        ]
      );

      // Keep author so technician
      // doesn't have to type their name
      // every single time.
      setCommentMessage('');
    } catch (error) {
      console.error(
        'Failed to add comment:',
        error
      );

      setCommentError(
        'Could not add update.'
      );
    } finally {
      setAddingComment(false);
    }
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        `Delete "${ticket.title}"? This cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await fetch(
        `http://localhost:5000/api/tickets/${ticket.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to delete ticket'
        );
      }

      onDelete(ticket.id);
    } catch (error) {
      console.error(
        'Failed to delete ticket:',
        error
      );

      alert(
        'Could not delete ticket.'
      );
    } finally {
      setDeleting(false);
    }
  };

  const isBusy =
    updatingStatus ||
    updatingAssignee ||
    deleting;

  // ==========================================
  // UI
  // ==========================================

  return (
    <article className="ticket-card">
      {/* DESCRIPTION */}

      <div className="ticket-description">
        {ticket.description}
      </div>

      {/* TICKET INFO */}

      <div className="ticket-meta">
        <div>
          <span>Requested By</span>

          <strong>
            {ticket.requester}
          </strong>
        </div>

        <div>
          <span>Assigned To</span>

          <strong>
            {ticket.assignee ||
              'Unassigned'}
          </strong>
        </div>

        <div>
          <span>Created</span>

          <strong>
            {new Date(
              ticket.createdAt
            ).toLocaleDateString()}
          </strong>
        </div>
      </div>

      {/* MANAGEMENT — ALWAYS VISIBLE */}

      <div className="ticket-management">
        <div className="management-grid">

          {/* LEFT SIDE */}

          <section className="management-panel">
            <p className="eyebrow">
              WORKFLOW
            </p>

            <h4>
              Ticket Management
            </h4>

            <label>
              Current Status

              <select
                value={ticket.status}
                onChange={
                  handleStatusChange
                }
                disabled={isBusy}
              >
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
            </label>

            <div
              style={{
                marginBottom: '18px',
              }}
            >
              <StatusBadge
                status={ticket.status}
              />

              {updatingStatus && (
                <span
                  className="muted-text"
                  style={{
                    marginLeft: '8px',
                  }}
                >
                  Updating...
                </span>
              )}
            </div>

            <label>
              Assigned Technician

              <input
                type="text"
                value={assignee}
                placeholder="Enter technician name"
                onChange={(event) =>
                  setAssignee(
                    event.target.value
                  )
                }
                disabled={isBusy}
              />
            </label>

            <div className="assignment-actions">
              <button
                type="button"
                onClick={
                  handleAssigneeUpdate
                }
                disabled={isBusy}
              >
                {updatingAssignee
                  ? 'Saving...'
                  : ticket.assignee
                    ? 'Update Assignment'
                    : 'Assign Technician'}
              </button>

              {ticket.assignee && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleUnassign}
                  disabled={isBusy}
                >
                  Unassign
                </button>
              )}
            </div>

            <div
              style={{
                marginTop: '24px',
                paddingTop: '18px',
                borderTop:
                  '1px solid rgba(148, 163, 184, 0.13)',
              }}
            >
              <p className="eyebrow">
                DETAILS
              </p>

              <p className="muted-text">
                Category
              </p>

              <strong
                style={{
                  display: 'block',
                  marginBottom: '14px',
                  color: '#dce5f2',
                }}
              >
                {ticket.category}
              </strong>

              <p className="muted-text">
                Priority
              </p>

              <span
                className={`detail-priority priority-${ticket.priority.toLowerCase()}`}
              >
                {ticket.priority}
              </span>
            </div>
          </section>

          {/* RIGHT SIDE */}

          <section className="management-panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <p className="eyebrow">
                  ACTIVITY
                </p>

                <h4
                  style={{
                    margin: 0,
                  }}
                >
                  Ticket History
                </h4>
              </div>

              {!loadingComments && (
                <span className="queue-count">
                  {comments.length}
                </span>
              )}
            </div>

            {/* COMMENTS */}

            <div className="activity-list">
              {loadingComments ? (
                <p className="muted-text">
                  Loading activity...
                </p>
              ) : comments.length > 0 ? (
                comments.map(
                  (comment) => (
                    <div
                      key={comment.id}
                      className="activity-item"
                    >
                      <div className="activity-header">
                        <strong>
                          {comment.author}
                        </strong>

                        <span>
                          {new Date(
                            comment.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>

                      <p>
                        {comment.message}
                      </p>
                    </div>
                  )
                )
              ) : (
                <div>
                  <p className="muted-text">
                    No activity yet.
                  </p>

                  <p className="muted-text">
                    Add the first update
                    below.
                  </p>
                </div>
              )}
            </div>

            {/* ADD COMMENT */}

            <form
              className="comment-form"
              onSubmit={
                handleAddComment
              }
            >
              <input
                type="text"
                placeholder="Your name"
                value={commentAuthor}
                onChange={(event) =>
                  setCommentAuthor(
                    event.target.value
                  )
                }
                disabled={addingComment}
              />

              <textarea
                placeholder="Write an update about this ticket..."
                value={commentMessage}
                onChange={(event) =>
                  setCommentMessage(
                    event.target.value
                  )
                }
                disabled={addingComment}
              />

              <button
                type="submit"
                disabled={addingComment}
              >
                {addingComment
                  ? 'Adding Update...'
                  : '+ Add Update'}
              </button>
            </form>

            {commentError && (
              <p className="error-text">
                {commentError}
              </p>
            )}
          </section>
        </div>

        {/* DELETE */}

        <div className="danger-zone">
          <button
            type="button"
            className="delete-ticket-button"
            onClick={handleDelete}
            disabled={isBusy}
          >
            {deleting
              ? 'Deleting...'
              : 'Delete Ticket'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default TicketCard;