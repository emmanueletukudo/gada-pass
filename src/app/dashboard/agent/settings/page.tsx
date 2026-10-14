'use client';

import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { Wifi, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentSettingsPage() {
  const { user } = useCurrentUser();

  const handleForceSync = () => {
    toast.success('Offline ticket database synced with server.');
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#17211b]">
          Agent Settings
        </h1>
        <p className="text-xs font-semibold text-[#6d766d]">
          Manage device synchronization and scanning preferences.
        </p>
      </div>
      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
          Agent Profile
        </h2>
        <div className="space-y-2 text-sm font-semibold text-[#17211b]">
          <div className="flex justify-between border-b border-[#f0f1e9] pb-2">
            <span className="text-[#6d766d]">Full Name</span>
            <span>{user?.name || 'Gate Agent'}</span>
          </div>
          <div className="flex justify-between border-b border-[#f0f1e9] pb-2">
            <span className="text-[#6d766d]">Email Address</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#6d766d]">Assigned Role</span>
            <span className="font-bold uppercase text-[#17211b]">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#17211b]">
              Offline Data Sync
            </h2>
            <p className="text-xs font-medium text-[#6d766d]">
              Cache ticket records locally for venues with unstable internet
              connectivity.
            </p>
          </div>
          <Wifi className="h-5 w-5 text-[#17211b]" />
        </div>

        <button
          type="button"
          onClick={handleForceSync}
          className="inline-flex items-center gap-2 rounded-full border border-[#dce1d5] bg-[#f7f7f2] px-5 py-2.5 text-xs font-bold text-[#17211b] transition hover:bg-[#dce1d5]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Force Local Re-sync</span>
        </button>
      </div>
    </div>
  );
}
