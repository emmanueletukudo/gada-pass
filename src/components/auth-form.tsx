'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getDashboardPathForRole, register } from '@/lib/auth';
import { GadaInput } from './common/gada-inputs';
import { toast } from 'sonner';
import { getSession, signIn } from 'next-auth/react';
import { UserRole } from '@/types/next-auth';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { OtpInput } from './common/otp-input';
import { api } from '@/lib/api';


const getSchema = (mode: 'login' | 'register', step: number) => {
  return z
    .object({
      email: z.string().email('Please enter a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      otp: z.string().optional(),
      accountType: z.enum(['INDIVIDUAL', 'ORGANIZATION']).optional(),
      firstName:
        mode === 'register' && step >= 3
          ? z.string().min(1, 'First name is required')
          : z.string().optional(),
      lastName:
        mode === 'register' && step >= 3
          ? z.string().min(1, 'Last name is required')
          : z.string().optional(),
      phone:
        mode === 'register' && step >= 3
          ? z.string().min(7, 'Phone number is required')
          : z.string().optional(),
      hostName:
        mode === 'register' && step >= 4
          ? z.string().min(1, 'Host name is required')
          : z.string().optional(),
      confirmPassword:
        mode === 'register' && step >= 4
          ? z.string().min(1, 'Please confirm your password')
          : z.string().optional(),
      role: z.enum(['ATTENDEE', 'ORGANIZER']).optional(),
    })
    .refine(
      (data) => {
        if (mode === 'register' && step >= 4) {
          return data.password === data.confirmPassword;
        }
        return true;
      },
      {
        message: 'Passwords did not match!',
        path: ['confirmPassword'],
      },
    );
};

type Values = z.infer<ReturnType<typeof getSchema>>;

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);

  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    setValue,
    trigger,
  } = useForm<Values>({
    resolver: zodResolver(getSchema(mode, step)),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      otp: '',
      accountType: 'INDIVIDUAL',
      firstName: '',
      lastName: '',
      phone: '',
      hostName: '',
      role: 'ATTENDEE',
    },
  });

  const firstNameValue = watch('firstName');

  useEffect(() => {
    if (firstNameValue && !watch('hostName')) {
      setValue('hostName', firstNameValue);
    }
  }, [firstNameValue, setValue, watch]);

 const handleOtpComplete = async (otpValue: string) => {
   setIsVerifyingOtp(true);
   try {
     await api('/auth/verify-otp', {
       method: 'POST',
       body: JSON.stringify({
         email: watch('email'),
         otp: otpValue,
       }),
     });

     toast.success('Email verified successfully!');
     setStep(3);
   } catch (err: any) {
     toast.error(err.message || 'Invalid or expired code');
     setError('otp', { message: 'Invalid or expired code' });
   } finally {
     setIsVerifyingOtp(false);
   }
 };

 const handleResendOtp = async () => {
   try {
     await api('/auth/send-otp', {
       method: 'POST',
       body: JSON.stringify({
         email: watch('email'),
       }),
     });

     toast.success('A new verification code has been sent!');
   } catch (err: any) {
     toast.error(err.message || 'Failed to resend code');
   }
 };

  const handleRedirect = async () => {
    const session = await getSession();
    if (session?.user.role) {
      const redirectPath = getDashboardPathForRole(
        session.user.role as UserRole,
      );
      router.push(redirectPath);
      router.refresh();
    } else {
      router.push('/dashboard');
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      const isEmailValid = await trigger('email');
      const emailValue = watch('email');

      if (!isEmailValid || !emailValue) {
        toast.error('Please enter a valid email address.');
        return;
      }

      setIsSendingCode(true);
      try {
        await api('/auth/send-otp', {
          method: 'POST',
          body: JSON.stringify({ email: emailValue }),
        });

        toast.success('Verification code sent to your email.');
        setStep(2);
      } catch (err: any) {
        toast.error(err.message || 'Failed to send verification code.');
      } finally {
        setIsSendingCode(false);
      }
    } else if (step === 2) {
      const otpValue = watch('otp') || '';
      if (otpValue.length < 6) {
        toast.error('Please enter the full 6-digit verification code.');
        setError('otp', { message: '6-digit code is required' });
        return;
      }
      await handleOtpComplete(otpValue);
    } else if (step === 3) {
      const isStep3Valid = await trigger([
        'accountType',
        'firstName',
        'lastName',
        'phone',
      ]);

      if (!isStep3Valid) {
        toast.error('Please fill in all required fields before continuing.');
        return;
      }
      setStep(4);
    }
  };

  const submit = async (values: Values) => {
    try {
      if (mode === 'login') {
        const result = await signIn('credentials', {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          toast.error(result.error);
          return;
        }
        await handleRedirect();
      } else {
        if (values.password !== values.confirmPassword) {
          setError('confirmPassword', { message: 'Passwords did not match!' });
          return;
        }

        await register({
          firstName: values.firstName!,
          lastName: values.lastName!,
          email: values.email,
          phone: values.phone!,
          password: values.password!,
          hostName: values.hostName!,
          accountType: values.accountType ?? 'INDIVIDUAL',
          role:
            values.accountType  === 'ORGANIZATION' ? 'ORGANIZER' : 'ATTENDEE',
        });

        toast.success('Account created successfully!');
        router.push('/auth/login');
        router.refresh();
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to continue',
      );
      setError('root', {
        message: error instanceof Error ? error.message : 'Unable to continue',
      });
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      {mode === 'register' && (
        <>
          {step === 1 && (
            <div className="space-y-4">
              <GadaInput
                register={field}
                name="email"
                type="email"
                placeHolder="Email Address"
                required
                label="Email Address"
                error={errors.email?.message}
              />
              <button
                type="button"
                disabled={isSendingCode || !watch('email')}
                onClick={handleNextStep}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-4 font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                {isSendingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Continue with Email</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-[#dce1d5] bg-[#fffef9] py-3.5 font-bold text-[#17211b] transition hover:bg-[#f7f7f2]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.16 21.37 7.23 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.43 8.15 0 9.89 0 12s.43 3.85 1.2 5.4l4.08-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.63 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={isVerifyingOtp}
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6d766d] hover:text-[#17211b] disabled:opacity-50"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="text-xs font-semibold text-[#6d766d]">
                  Step 2 of 4
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#17211b]">
                  Enter Verification Code
                </h3>
                <p className="mt-0.5 text-xs text-[#6d766d]">
                  We sent a 6-digit verification code to{' '}
                  <span className="font-bold text-[#17211b]">
                    {watch('email')}
                  </span>
                  .
                </p>
              </div>
              <OtpInput
                length={6}
                value={watch('otp') || ''}
                isVerifying={isVerifyingOtp}
                onChange={(otpVal) =>
                  setValue('otp', otpVal, { shouldValidate: true })
                }
                onComplete={handleOtpComplete}
                onResend={handleResendOtp}
                error={errors.otp?.message}
              />

              <button
                type="button"
                disabled={isVerifyingOtp || (watch('otp') || '').length < 6}
                onClick={() => handleOtpComplete(watch('otp') || '')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#17211b] py-4 font-bold text-white transition hover:bg-[#25332b] disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#d6f94a]" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6d766d] hover:text-[#17211b]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="text-xs font-semibold text-[#6d766d]">
                  Step 3 of 4
                </span>
              </div>

              <fieldset className="space-y-2">
                <legend className="text-xs font-bold uppercase tracking-wider text-[#6d766d]">
                  Account Type
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(['INDIVIDUAL', 'ORGANIZATION'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#dce1d5] bg-[#fffef9] py-3 text-xs font-bold has-checked:border-[#17211b] has-checked:bg-[#d6f94a]"
                    >
                      <input
                        {...field('accountType')}
                        type="radio"
                        value={type}
                        className="sr-only"
                      />
                      {type === 'INDIVIDUAL' ? 'Individual' : 'Organization'}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-3 sm:grid-cols-2">
                <GadaInput
                  register={field}
                  name="firstName"
                  type="text"
                  placeHolder="First name"
                  label="First Name"
                  required
                  error={errors.firstName?.message}
                />
                <GadaInput
                  register={field}
                  name="lastName"
                  type="text"
                  placeHolder="Last name"
                  label="Last Name"
                  required
                  error={errors.lastName?.message}
                />
              </div>

              <GadaInput
                register={field}
                name="phone"
                type="tel"
                placeHolder="Phone Number"
                label="Phone Number"
                required
                error={errors.phone?.message}
              />

              <button
                type="button"
                onClick={handleNextStep}
                className="w-full rounded-full bg-[#17211b] py-4 font-bold text-white transition hover:bg-[#25332b]"
              >
                Next Step
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#6d766d] hover:text-[#17211b]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
                <span className="text-xs font-semibold text-[#6d766d]">
                  Step 4 of 4
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-[#17211b]">
                    Host Name
                  </label>
                  <div className="group relative flex items-center">
                    <Info className="h-3.5 w-3.5 text-[#6d766d] cursor-pointer hover:text-[#17211b]" />
                    <div className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#17211b] px-2.5 py-1 text-[10px] font-semibold text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                      This will be shown on the ticket
                      <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-[#17211b]" />
                    </div>
                  </div>
                </div>

                <GadaInput
                  register={field}
                  name="hostName"
                  type="text"
                  placeHolder="Host / Display Name"
                  required
                  error={errors.hostName?.message}
                />
              </div>

              <GadaInput
                register={field}
                name="password"
                type="password"
                placeHolder="Password"
                required
                label="Password"
                error={errors.password?.message}
              />

              <GadaInput
                register={field}
                name="confirmPassword"
                type="password"
                placeHolder="Confirm password"
                required
                label="Confirm password"
                error={errors.confirmPassword?.message}
              />

              <button
                disabled={isSubmitting}
                className="w-full rounded-full bg-[#17211b] py-4 font-bold text-white disabled:opacity-50 transition hover:bg-[#25332b]"
              >
                {isSubmitting ? 'Creating account...' : 'Complete Registration'}
              </button>
            </div>
          )}
        </>
      )}

      {mode === 'login' && (
        <div className="space-y-4">
          <GadaInput
            register={field}
            name="email"
            type="email"
            placeHolder="Email Address"
            required
            label="Email Address"
            error={errors.email?.message}
          />

          <GadaInput
            register={field}
            name="password"
            type="password"
            placeHolder="Password"
            required
            label="Password"
            error={errors.password?.message}
          />

          <button
            disabled={isSubmitting}
            className="w-full rounded-full items-center bg-[#17211b] py-4 font-bold text-white disabled:opacity-50 transition hover:bg-[#25332b]"
          >
            {isSubmitting ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#17211b]" />
            ) : 
              'Log in'
            }
          </button>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#dce1d5] bg-[#fffef9] py-3.5 font-bold text-[#17211b] transition hover:bg-[#f7f7f2]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.16 21.37 7.23 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.43 8.15 0 9.89 0 12s.43 3.85 1.2 5.4l4.08-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.16 2.63 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"
              />
            </svg>
            Continue with Google
          </button>
        </div>
      )}
    </form>
  );
}
