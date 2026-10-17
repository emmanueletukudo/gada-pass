import { openDB, DBSchema } from 'idb';

export interface CachedTicket {
  ticketId: string;
  guestFullName: string;
  tierName: string;
  status: 'PAID' | 'CHECKED_IN' | 'CANCELLED';
  eventId: string;
  checkedInAt?: string;
}

export interface OutboxItem {
  id?: number; 
  ticketId: string;
  eventId: string;
  timestamp: string;
}

interface GateDB extends DBSchema {
  tickets: {
    key: string;
    value: CachedTicket;
    indexes: { 'by-event': string };
  };
  outbox: {
    key: number;
    value: OutboxItem;
    autoIncrement: true;
  };
}

const DB_NAME = 'gate-agent-offline-db';
const DB_VERSION = 1;

export async function initOfflineDB() {
  return openDB<GateDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains('tickets')) {
        const store = db.createObjectStore('tickets', { keyPath: 'ticketId' });
        store.createIndex('by-event', 'eventId');
      }
      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

export async function queueOfflineCheckIn(ticketId: string, eventId: string, scanMod: 'IN' | "OUT") {
  const db = await initOfflineDB();
  await db.add('outbox', {
    ticketId,
    eventId,
    timestamp: new Date().toISOString(),
  });
}

export async function getPendingSyncCount(): Promise<number> {
  const db = await initOfflineDB();
  return db.count('outbox');
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  const db = await initOfflineDB();
  return db.getAll('outbox');
}

export async function removeOutboxItem(id: number) {
  const db = await initOfflineDB();
  await db.delete('outbox', id);
}

export async function saveManifestToCache(tickets: CachedTicket[]) {
  const db = await initOfflineDB();
  const tx = db.transaction('tickets', 'readwrite');

  for (const ticket of tickets) {
    await tx.store.put(ticket);
  }

  await tx.done;
}

export async function verifyTicketOffline(
  ticketId: string,
  eventId: string,
): Promise<CachedTicket | null> {
  const db = await initOfflineDB();
  const ticket = await db.get('tickets', ticketId);

  if (!ticket || ticket.eventId !== eventId) {
    return null; 
  }

  return ticket;
}


export async function markTicketCheckedInOffline(ticketId: string) {
  const db = await initOfflineDB();
  const ticket = await db.get('tickets', ticketId);

  if (ticket) {
    ticket.status = 'CHECKED_IN';
    ticket.checkedInAt = new Date().toISOString();
    await db.put('tickets', ticket);
  }
}
