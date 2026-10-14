"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { queueOfflineScan } from "@/lib/offline-scans";

export function ManualCheckIn() {
  const [payload, setPayload] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!payload.trim()) return;
    try {
      if (!navigator.onLine) {
        await queueOfflineScan({
          ticketCode: payload.trim(),
          scannedAt: new Date().toISOString(),
          agentId: "current-agent",
        });
        setMessage("Queued offline for sync");
      } else {
        await api("/check-in", {
          method: "POST",
          body: JSON.stringify({ qrPayload: payload.trim() }),
        });
        setMessage("Valid ticket · checked in");
      }
      setPayload("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invalid ticket");
    }
  };
  return (
    <form
      onSubmit={submit}
      className="mt-8 rounded-2xl border border-[#ffffff26] p-5"
    >
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#d6f94a]">
        Manual lookup
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          placeholder="Paste ticket QR payload"
          className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 text-sm text-[#17211b] outline-none"
        />
        <button className="rounded-xl bg-[#d6f94a] px-5 py-3 text-sm font-bold text-[#17211b]">
          Check in
        </button>
      </div>
      {message && (
        <p className="mt-3 text-sm font-bold text-white">{message}</p>
      )}
    </form>
  );
}
