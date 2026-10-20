import { useQuery } from '@tanstack/react-query';
import { api } from './useApi';

export interface DashboardData {
  eventId: string;
  eventName: string;
  eventType: string;
  startsAt: string;
  endsAt: string;
  orders: number;
  attendees: number;
  checkedIn: number;
  checkInRatePercentage: number;
  ticketTierCount: number;
  revenue: string | number;
  capacity: number | null;
  tierBreakdown: Array<{
    tierId: string;
    name: string;
    price: string;
    currency: string;
    quantityAllocated: number;
    soldCount: number;
    checkedInCount: number;
    isMultiDay: boolean;
    revenueGenerated: string;
    occupancyRate: number;
  }>;
  dailyFootTraffic: Array<{
    date: string;
    totalScans: number;
    uniqueAttendees: number;
  }>;
  hourlyVelocity: Array<{
    hour: string;
    scanCount: number;
  }>;
  agentPerformance: Array<{
    operatorId: string;
    operatorName: string;
    scansProcessed: number;
  }>;
}

export function useEventOverview(eventId: string) {
  return useQuery({
    queryKey: ['event-overview', eventId],
    queryFn: () => api<DashboardData>(`/organizer/events/${eventId}/dashboard`),
    enabled: Boolean(eventId),
  });
}
