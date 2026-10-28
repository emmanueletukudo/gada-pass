export interface TicketTierStats {
  tierName: string;
  totalSold: number;
  checkedIn: number;
}

export interface GateAgentStats {
  agentName: string;
  totalScans: number;
  offlineScans: number;
}

export interface HourlyTurnout {
  hourLabel: string;
  scanCount: number;
}

export interface EventAnalyticsData {
  eventId: string;
  eventName: string;
  venue: string;
  city: string;
  startedAt: string;
  endedAt: string;
  totalSold: number;
  totalCheckedIn: number;
  onlineScansCount: number;
  offlineScansCount: number;
  pendingSyncCount: number;
  tierBreakdown: TicketTierStats[];
  agentBreakdown: GateAgentStats[];
  turnoutHourly: HourlyTurnout[];
}
