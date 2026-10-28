'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api';

export type Role = 'ATTENDEE' | 'ORGANIZER' | 'GATE_AGENT' | 'ADMIN';

export type User = {
  id: string;
  email: string;
  name: string;
  hostName: string;
  logoUrl?: string;
  phone?: string;
  accountType: string;
  firstName?: string;
  lastName?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  isNewUser?: boolean;
  role: string;
};

export type AuthResponse = { accessToken: string; user?: User };

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  hostName: string;
  role: 'ATTENDEE' | 'ORGANIZER';
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
}

export interface OnboardingPayload {
  phone: string;
  hostName: string;
  accountType: 'INDIVIDUAL' | 'ORGANIZATION';
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  token: string;
  newPassword: string;
}

export function getDashboardPathForRole(role?: Role | string): string {
  switch (role) {
    case 'ADMIN':
      return '/dashboard/admin';
    case 'ORGANIZER':
      return '/dashboard/organizer';
    case 'GATE_AGENT':
      return '/dashboard/agent';
    case 'ATTENDEE':
    default:
      return '/dashboard/attendee';
  }
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: RegisterInput) => {
      const result = await api<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Account created successfully!');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    },
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return api('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      toast.success('Verification code sent to your email.');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send verification code';
      toast.error(message);
    },
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      return api('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });
    },
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Invalid or expired code';
      toast.error(message);
    },
  });
}

export function useUploadHostLogoDirect() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const { uploadUrl, publicUrl } = await api<{
        uploadUrl: string;
        fileKey: string;
        publicUrl: string;
      }>('/users/profile/logo-presign', {
        method: 'POST',
        body: JSON.stringify({ contentType: file.type }),
      });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image directly to storage.');
      }

      await api('/users/profile/logo', {
        method: 'PATCH',
        body: JSON.stringify({ logoUrl: publicUrl }),
      });

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Logo uploaded successfully!');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Failed to upload host logo';
      toast.error(message);
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: OnboardingPayload) => {
      const response = await api<AuthResponse>('/auth/complete-onboarding', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (typeof window !== 'undefined' && response?.accessToken) {
        localStorage.setItem('eventsgada_token', response.accessToken);
        if (response.user) {
          localStorage.setItem(
            'eventsgada_user',
            JSON.stringify(response.user),
          );
        }
      }

      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Onboarding completed successfully!');
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to complete onboarding';
      toast.error(message);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: ForgotPasswordInput) => {
      return api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      toast.success(
        'If the email exists, a password reset code has been sent.',
      );
    },
    onError: (error: any) => {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to send password reset code';
      toast.error(message);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (values: ResetPasswordInput) => {
      return api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      toast.success(
        'Password has been reset successfully. You can now log in.',
      );
    },
    onError: (error: any) => {
      const message =
        error instanceof Error ? error.message : 'Failed to reset password';
      toast.error(message);
    },
  });
}