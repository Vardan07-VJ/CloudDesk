import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const className = `status-badge ${status.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <span className={className}>
      {status}
    </span>
  );
};

export default StatusBadge;