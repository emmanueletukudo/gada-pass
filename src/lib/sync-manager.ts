import {
  getOutboxItems,
  removeOutboxItem,
  markTicketCheckedInOffline,
} from './offline-db';
import { api } from './api';
import { toast } from 'sonner';

let isSyncing = false;

export async function syncOfflineOutbox() {
  if (isSyncing || !navigator.onLine) return;

  isSyncing = true;
  try {
    const pendingItems = await getOutboxItems();
    if (pendingItems.length === 0) {
      isSyncing = false;
      return;
    }

    toast.info(`Syncing ${pendingItems.length} offline check-in(s)...`);

    for (const item of pendingItems) {
      try {
        await api('/events/check-in', {
          method: 'POST',
          body: JSON.stringify({
            qrPayload: item.ticketId,
            eventId: item.eventId,
          }),
        });
        await markTicketCheckedInOffline(item.ticketId);
        if (item.id) {
          await removeOutboxItem(item.id);
        }
      } catch (err) {
        console.error(`Failed to sync ticket ${item.ticketId}:`, err);
      }
    }

    toast.success('All offline check-ins successfully synced to server!');
  } catch (err) {
    console.error('Sync queue error:', err);
  } finally {
    isSyncing = false;
  }
}

