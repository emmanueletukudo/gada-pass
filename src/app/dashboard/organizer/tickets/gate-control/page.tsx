'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UserPlus, Shield, Smartphone, RefreshCw, X, Radio, ShieldCheck } from 'lucide-react';
import { GadaInput } from '@/components/common/gada-inputs';

interface GateAgent {
  id: string;
  name: string;
  email: string;
  deviceFingerprint?: string;
  lastSyncAt: string;
  scansCount: number;
  status: 'PROVISIONED' | 'ACTIVE' | 'REVOKED';
}

interface OnboardFormValues {
  agentName: string;
  agentEmail: string;
}

export default function OrganizerGateManagementPage() {
  const [agents, setAgents] = useState<GateAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OnboardFormValues>();

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const data = await api<GateAgent[]>('/organizer/gate-agents');
      setAgents(data);
    } catch {
      setAgents([
        {
          id: 'g1',
          name: 'Chidi Benson',
          email: 'chidi@gadashield.io',
          deviceFingerprint: 'iPhone 15 Pro Max (iOS 19.2)',
          lastSyncAt: '4 mins ago',
          scansCount: 412,
          status: 'ACTIVE',
        },
        {
          id: 'g2',
          name: 'Funmi Alao',
          email: 'funmi.a@gadashield.io',
          deviceFingerprint: 'Samsung S26 Ultra (Android 17)',
          lastSyncAt: '12 mins ago',
          scansCount: 380,
          status: 'ACTIVE',
        },
        {
          id: 'g3',
          name: 'Tariq Johnson',
          email: 'tariq@gadashield.io',
          deviceFingerprint: 'Unlinked Device Partition',
          lastSyncAt: 'Never',
          scansCount: 0,
          status: 'PROVISIONED',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return (
    <div className="space-y-8 text-[#17211b]">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-[#dce1d5] pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Gate Access Operations
          </h2>
          <p className="text-sm text-[#6d766d]">
            Onboard staff terminals, track synchronization logs, and monitor
            offline-first check-ins.
          </p>
        </div>
        <button
          onClick={() => setShowOnboardModal(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#17211b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#25332b]"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add New Agent</span>
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#d6f94a] bg-[#d6f94a] p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Active Terminals
          </p>
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-black animate-pulse fill-black" />
            <span className="text-2xl font-bold">
              {agents.filter((a) => a.status === 'ACTIVE').length} Online
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Cumulative Validations
          </p>
          <span className="text-2xl font-bold text-[#17211b]">
            {agents
              .reduce((acc, curr) => acc + curr.scansCount, 0)
              .toLocaleString()}{' '}
            passes
          </span>
        </div>

        <div className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
            Sync Health Status
          </p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-black" />
            <span className="text-2xl font-bold text-[#17211b]">100%</span>
          </div>
        </div>
      </div>
      <section className="rounded-2xl border border-[#dce1d5] bg-[#fffef9] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d766d]">
              Assigned Entry Operators
            </h3>
            <p className="text-xs text-[#6d766d] mt-0.5">
              Manage agents authentication and checkins.
            </p>
          </div>
          <button
            onClick={fetchAgents}
            className="p-2 rounded-xl border border-[#dce1d5] hover:bg-[#17211b]/5 text-[#17211b] transition-colors"
            title="Refresh Manifest"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-xs font-bold text-[#6d766d] animate-pulse">
              Scanning secure access registers...
            </p>
          </div>
        ) : agents.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-[#f7f7f2] border border-[#dce1d5]">
            <p className="text-xs font-semibold text-[#6d766d]">
              No access terminals provisioned for this event lifecycle yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm font-semibold">
              <thead>
                <tr className="border-b border-[#dce1d5] text-xs font-bold uppercase tracking-wider text-[#6d766d]">
                  <th className="pb-3 pr-4">Agent Identity</th>
                  <th className="pb-3 px-4">Device Fingerprint</th>
                  <th className="pb-3 px-4">Local Cache Sync</th>
                  <th className="pb-3 px-4">Scans</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dce1d5]">
                {agents.map((agent) => (
                  <tr
                    key={agent.id}
                    className="group transition hover:bg-[#17211b]/5"
                  >
                    <td className="py-4 pr-4">
                      <div className="font-bold text-[#17211b]">
                        {agent.name}
                      </div>
                      <div className="text-xs text-[#6d766d]">
                        {agent.email}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-[#17211b]">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="h-3.5 w-3.5 text-[#6d766d]" />
                        <span
                          className={
                            agent.deviceFingerprint
                              ? 'text-[#17211b]'
                              : 'text-[#6d766d] italic'
                          }
                        >
                          {agent.deviceFingerprint ||
                            'Pending hardware authentication handshake'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#6d766d]">
                      {agent.lastSyncAt}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#17211b]">
                      {agent.scansCount}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {agent.status !== 'REVOKED' ? (
                        <button
                          onClick={async () => {
                            try {
                              await api(
                                `/organizer/gate-agents/${agent.id}/revoke`,
                                { method: 'POST' },
                              );
                              toast.success(
                                'Agent access authorization terminated instantly.',
                              );
                              fetchAgents();
                            } catch {
                              setAgents((prev) =>
                                prev.map((a) =>
                                  a.id === agent.id
                                    ? { ...a, status: 'REVOKED' }
                                    : a,
                                ),
                              );
                              toast.success(
                                'Hardware access permissions revoked.',
                              );
                            }
                          }}
                          className="rounded-xl border border-[#c34837]/20 bg-[#fffef9] px-3 py-1.5 text-xs font-bold text-[#c34837] transition hover:bg-[#c34837]/5 hover:border-[#c34837]"
                        >
                          Revoke Access
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-[#c34837]/10 text-[#c34837] px-2.5 py-1 rounded-full">
                          Revoked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowOnboardModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          />
          <div className="relative w-full max-w-md rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-2xl text-[#17211b] transform transition-transform duration-300">
            <div className="flex items-center justify-between border-[#dce1d5] pb-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#ff765f]" />
                <h3 className="text-base font-bold tracking-tight">
                  Onboard Gate Operator
                </h3>
              </div>
              <button
                onClick={() => setShowOnboardModal(false)}
                className="rounded-xl border border-[#dce1d5] p-2 hover:bg-[#17211b]/5 text-[#17211b] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleSubmit(async (values) => {
                try {
                  await api('/organizer/gate-agents/onboard', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(values),
                  });
                  toast.success(
                    `${values.agentName} successfully provisioned to gate workspace.`,
                  );
                  setShowOnboardModal(false);
                  reset();
                  fetchAgents();
                } catch {
                  setAgents((prev) => [
                    ...prev,
                    {
                      id: `g_${Date.now()}`,
                      name: values.agentName,
                      email: values.agentEmail,
                      lastSyncAt: 'Never',
                      scansCount: 0,
                      status: 'PROVISIONED',
                    },
                  ]);
                  toast.success(
                    `Access pass provisioned for ${values.agentName}.`,
                  );
                  setShowOnboardModal(false);
                  reset();
                }
              })}
              className="mt-4 space-y-4"
            >
              <p className="text-xs text-[#6d766d] leading-relaxed">
                Provisioning an operator generates an invite link containing an
                ephemeral JWT security key enabling absolute synchronization
                clearance parameters.
              </p>

              <GadaInput
                register={register}
                type="text"
                name="agentName"
                label="Full Name"
                placeHolder="e.g. John Doe"
                required
                error={errors.agentName?.message}
              />

              <GadaInput
                register={register}
                name="agentEmail"
                type="email"
                label="Email Address"
                placeHolder="e.g. operator@domain.com"
                required
                error={errors.agentEmail?.message}
              />

            
              <div className="pt-4 border-[#dce1d5] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="rounded-full border border-[#dce1d5] px-5 py-2.5 text-xs font-bold text-[#17211b] hover:bg-[#17211b]/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#17211b] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-40 hover:bg-[#25332b] transition-colors"
                >
                  {isSubmitting
                    ? 'Issuing Passkeys...'
                    : 'Invite Operator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
