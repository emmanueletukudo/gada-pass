import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface OrganizerOverview {
  totalEvents: number;
  activeEvents: number;
  grossRevenue: string;
  totalOrders: number;
  totalTicketsSold: number;
  totalCheckIns: number;
  overallTurnoutRate: number;
  recentEvents: Array<{
    id: string;
    name: string;
    status: string;
    startsAt: string;
    eventType: string;
  }>;
  monthlyRevenueGraph: Array<{
    month: string;
    revenue: number;
    checkIns?: number;
  }>;
}

export function useOrganizerDashboard() {
  return useQuery({
    queryKey: ['organizer-dashboard-overview'],
    queryFn: () => api<OrganizerOverview>('/organizer/dashboard/overview'),
  });
}
