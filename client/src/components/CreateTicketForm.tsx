import React, { useState } from 'react';
import type { Ticket } from '../types/Ticket';

interface CreateTicketFormProps {
  onSubmit: (
    ticket: Omit<
      Ticket,
      'id' | 'createdAt' | 'status' | 'assignee'
    >
  ) => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [priority, setPriority] = useState('Low');
  const [requester, setRequester] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      title,
      description,
      category,
      priority,
      requester,
    });

    setTitle('');
    setDescription('');
    setCategory('Other');
    setPriority('Low');
    setRequester('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="requester">Requested By:</label>
        <input
          type="text"
          id="requester"
          value={requester}
          onChange={(e) => setRequester(e.target.value)}
          placeholder="Your name"
          required
        />
      </div>

      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Briefly describe the issue"
          required
        />
      </div>

      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what is happening..."
          required
        />
      </div>

      <div>
        <label htmlFor="category">Category:</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Hardware">Hardware</option>
          <option value="Software">Software</option>
          <option value="Network">Network</option>
          <option value="Account / Access">Account / Access</option>
          <option value="Email">Email</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="priority">Priority:</label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <button type="submit">Create Ticket</button>
    </form>
  );
};

export default CreateTicketForm;