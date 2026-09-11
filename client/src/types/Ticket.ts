export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  requester: string;
  assignee: string | null;
  createdAt: string;
}