export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  skills?: string[];
}


// Added for UserManagementModal.tsx
export interface UpdateUserData {
  name?: string;
  email?: string; // This was missing
  role?: Role;
  skills?: string[];
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent',
}

export enum TicketStatus {
  OPEN = 'Open',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed',
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  user: User | string;
  assignedTo?: User | string;
  status: TicketStatus;
  priority?: Priority;
  category?: string;
  aiNotes?: string;
  
  isDuplicate: boolean;      // To identify if this is a linked ticket
  parentTicket?: {           // Populated for duplicate tickets
    _id: string;
    title: string;
    status: string;
  };
  reportCount: number;
  // Updated/Added fields based on your error logs:
  requiredSkills?: string[];
  relatedSkills?: string[];    // Added (referenced in TicketCard and DetailPage)
  moderatorMessage?: string;   // Added (referenced in TicketDetailPage)
  helpfulNotes?: string;       // Added (referenced in TicketDetailPage)
  
  createdAt: string;
  updatedAt: string;
}