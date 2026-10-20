'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Logo } from '@/components/logo';
import { GadaInput } from '@/components/common/gada-inputs';
import { toast } from 'sonner';
import { UserCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useInviteInfo, useAcceptInvite } from '@/lib/hooks-new/useAgentInvite';

const acceptInviteSchema = z
  .object({
    password: z.string().optional().or(z.literal('')),
    confirmPassword: z.string().optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.length > 0) {
      if (data.password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Password must be at least 8 characters',
          path: ['password'],
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passwords do not match',
          path: ['confirmPassword'],
        });
      }
    }
  });

type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const {
    data: inviteInfo,
    isPending: isLoadingInfo,
    error: queryError,
  } = useInviteInfo(token);

  const { mutate: acceptInvite, isPending: isSubmitting } = useAcceptInvite();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteFormData>({
    resolver: zodResolver(acceptInviteSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const handleAccept = (data: AcceptInviteFormData) => {
    if (!token) {
      toast.error('Invitation token is missing.');
      return;
    }

    acceptInvite(
      {
        token,
        ...(data.password ? { password: data.password } : {}),
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || 'Invitation accepted successfully!');
          router.push('/dashboard/agent');
        },
        onError: (err) => {
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to accept invitation. Please try again.';
          toast.error(message);
        },
      },
    );
  };

  const tokenError =
    !token || token.trim().length === 0
      ? 'Missing or invalid invitation token.'
      : queryError instanceof Error
        ? queryError.message
        : queryError
          ? 'Invalid or expired invitation token.'
          : null;

  if (isLoadingInfo) {
    return (
      <div className="flex min-h-75 flex-col items-center justify-center text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#17211b]" />
        <p className="mt-4 text-xs font-bold text-[#6d766d]">
          Validating invitation link...
        </p>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="flex min-h-87.5 flex-col items-center justify-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#ff765f]/10 text-[#c34837]">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#17211b]">Invalid Link</h2>
        <p className="mt-2 text-sm text-[#6d766d]">{tokenError}</p>
        <button
          type="button"
          onClick={() => router.push('/auth/login')}
          className="mt-6 rounded-full bg-[#17211b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#25332b]"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-8 shadow-sm">
      <div className="flex flex-col items-center text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#d6f94a] text-[#17211b] shadow-sm">
          <UserCheck className="h-7 w-7" />
        </div>

        <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#17211b]">
          Accept Agent Invitation
        </h1>
        <p className="mt-2 text-xs font-semibold leading-relaxed text-[#6d766d]">
          You have been invited to join{' '}
          <span className="text-[#17211b] font-bold">
            {inviteInfo?.eventName}
          </span>{' '}
          as a Gate Agent.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleAccept)} className="mt-8 space-y-4">
        {inviteInfo?.isExistingUser ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#dce1d5] bg-[#f7f7f2] p-4 text-center text-xs text-[#6d766d]">
              An account already exists for{' '}
              <span className="font-bold text-[#17211b]">
                {inviteInfo.email}
              </span>
              . You can join this event directly using your existing
              credentials.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Linking Account...
                </span>
              ) : (
                <span>Accept & Join Team</span>
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-[#6d766d]">
              Set your account password below to finish setting up your new Gate
              Agent profile for{' '}
              <span className="font-semibold text-[#17211b]">
                {inviteInfo?.email}
              </span>
              .
            </p>

            <GadaInput
              register={register}
              name="password"
              type="password"
              placeHolder="At least 8 characters"
              label="Set Account Password"
              error={errors.password?.message}
            />
            <GadaInput
              register={register}
              name="confirmPassword"
              type="password"
              placeHolder="Re-enter your password"
              label="Confirm Password"
              error={errors.confirmPassword?.message}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-sm font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <span>Complete Registration & Join</span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="min-h-screen bg-[#f0f1e9] px-5 py-12 md:px-10">
      <header className="mx-auto mb-10 max-w-7xl flex items-center justify-between">
        <Logo />
      </header>
      <Suspense
        fallback={
          <div className="grid min-h-75 place-items-center text-sm font-bold text-[#6d766d]">
            Loading invitation details...
          </div>
        }
      >
        <AcceptInviteContent />
      </Suspense>
    </main>
  );
}
