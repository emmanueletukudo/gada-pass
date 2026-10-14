'use client';

import {
  useRef,
  useState,
  KeyboardEvent,
  ClipboardEvent,
  useEffect,
} from 'react';
import { Loader2 } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (otp: string) => void;
  onComplete?: (otp: string) => void;
  onResend?: () => Promise<void> | void;
  error?: string;
  disabled?: boolean;
  isVerifying?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  onResend,
  error,
  disabled = false,
  isVerifying = false,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || ''),
  );
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const newDigits = Array.from({ length }, (_, i) => value[i] || '');
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    if (disabled || isVerifying) return;

    const sanitizedVal = val.replace(/[^0-9]/g, '');
    if (!sanitizedVal && val !== '') return;

    const newDigits = [...digits];
    const digit = sanitizedVal.slice(-1);
    newDigits[index] = digit;
    setDigits(newDigits);

    const combinedOtp = newDigits.join('');
    onChange(combinedOtp);

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger auto-complete when the last digit is entered
    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || isVerifying) return;

    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (disabled || isVerifying) return;
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text/plain').trim();
    const numericData = pastedData.replace(/[^0-9]/g, '').slice(0, length);

    if (!numericData) return;

    const newDigits = Array.from({ length }, (_, i) => numericData[i] || '');
    setDigits(newDigits);

    const combinedOtp = newDigits.join('');
    onChange(combinedOtp);

    const nextFocusIndex = Math.min(numericData.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();

    if (combinedOtp.length === length && onComplete) {
      onComplete(combinedOtp);
    }
  };

  const handleResendClick = async () => {
    if (isResending || disabled || isVerifying || !onResend) return;

    setIsResending(true);
    try {
      await onResend();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Boxes Grid */}
      <div className="relative">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {Array.from({ length }).map((_, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digits[index] || ''}
              disabled={disabled || isVerifying}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className={`h-12 w-full max-w-12.5 rounded-2xl border bg-white text-center text-lg font-bold text-[#17211b] outline-none transition focus:border-[#17211b] focus:ring-2 focus:ring-[#17211b]/10 disabled:opacity-50 ${
                error
                  ? 'border-[#c34837] bg-[#c34837]/5'
                  : 'border-[#dce1d5] focus:border-[#17211b]'
              }`}
            />
          ))}
        </div>

        {/* Verifying Overlay */}
        {isVerifying && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
            <div className="flex items-center gap-2 rounded-full bg-[#17211b] px-4 py-1.5 text-xs font-bold text-white shadow-sm">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#d6f94a]" />
              <span>Verifying code...</span>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-semibold text-[#c34837]">{error}</p>}

      {/* Resend Code Trigger */}
      {onResend && (
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[#6d766d]">Didn&apos;t receive code?</span>
          <button
            type="button"
            disabled={isResending || isVerifying || disabled}
            onClick={handleResendClick}
            className="inline-flex items-center gap-1.5 font-bold text-[#17211b] hover:underline disabled:opacity-50"
          >
            {isResending && (
              <Loader2 className="h-3 w-3 animate-spin text-[#17211b]" />
            )}
            <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
