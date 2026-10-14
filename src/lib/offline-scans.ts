import { del, get, set } from "idb-keyval";
import { api } from "./api";

export type OfflineScan = {
  ticketCode: string;
  scannedAt: string;
  agentId: string;
};

const SCAN_QUEUE_KEY = "eventsgada-scan-queue";

export async function queueOfflineScan(scan: OfflineScan) {
  const queue = (await get<OfflineScan[]>(SCAN_QUEUE_KEY)) ?? [];
  await set(SCAN_QUEUE_KEY, [...queue, scan]);
}

export async function getOfflineScans() {
  return (await get<OfflineScan[]>(SCAN_QUEUE_KEY)) ?? [];
}

export async function flushOfflineScans() {
  const queue = await getOfflineScans();
  for (const scan of queue) {
    await api("/check-in", {
      method: "POST",
      body: JSON.stringify({ qrPayload: scan.ticketCode }),
    });
  }
  if (queue.length) await del(SCAN_QUEUE_KEY);
  return queue.length;
}
