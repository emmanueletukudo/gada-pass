export interface AgentUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

export interface Agent {
  id: string;
  clearanceLevel: string;
  isActive: boolean;
  createdAt: string;
  user: AgentUser;
}

export interface AgentInvitation {
  id: string;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
  createdAt: string;
}

export interface EventAgentsResponse {
  agents: Agent[];
  invitations: AgentInvitation[];
}
