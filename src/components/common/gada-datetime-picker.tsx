'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Minus,
  Plus,
} from 'lucide-react';

interface GadaDateTimePickerProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  error?: string;
  required?: boolean;
  minDate?: Date; 
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function GadaDateTimePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  error,
  required,
  minDate,
}: GadaDateTimePickerProps<TFieldValues>) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'up' | 'down'>('up');
  const triggerRef = useRef<HTMLButtonElement>(null);

  const calculatePlacement = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const PICKER_HEIGHT = 340;

      if (spaceAbove >= PICKER_HEIGHT) {
        setPlacement('up');
      } else {
        setPlacement('down');
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      calculatePlacement();
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('resize', calculatePlacement);
      window.addEventListener('scroll', calculatePlacement, true);
    }
    return () => {
      window.removeEventListener('resize', calculatePlacement);
      window.removeEventListener('scroll', calculatePlacement, true);
    };
  }, [isOpen]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange } }) => {
        const currentDate = value ? new Date(value) : new Date();

        const formattedDisplay = currentDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });

        return (
          <div className="relative space-y-1">
            <label className="text-md tracking-wider text-[#6d766d]">
              {label} {required && <span className="text-[#c34837]">*</span>}
            </label>

            <button
              ref={triggerRef}
              type="button"
              onClick={handleToggle}
              className="flex w-full items-center justify-between rounded-2xl border border-[#dce1d5] bg-[#fffef9] px-4 py-3 text-xs font-semibold text-[#17211b] outline-none transition hover:border-[#17211b]"
            >
              <span>{value ? formattedDisplay : 'Select Date & Time'}</span>
              <CalendarIcon className="h-4 w-4 text-[#6d766d]" />
            </button>

            {error && <p className="text-[11px] text-[#c34837]">{error}</p>}

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div
                  className={`absolute left-0 z-50 w-full max-w-90 rounded-3xl border border-[#232527] bg-[#141517] p-5 text-white shadow-2xl ${
                    placement === 'up' ? 'bottom-full -mb-5' : 'top-full'
                  }`}
                >
                  <DateTimePickerCard
                    date={currentDate}
                    minDate={minDate}
                    onChange={(newDate) => {
                      onChange(newDate.toISOString());
                    }}
                  />
                </div>
              </>
            )}
          </div>
        );
      }}
    />
  );
}

function DateTimePickerCard({
  date,
  minDate,
  onChange,
}: {
  date: Date;
  minDate?: Date;
  onChange: (d: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date(date));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const selectedDay = date.getDate();
  const selectedMonth = date.getMonth();
  const selectedYear = date.getFullYear();

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPm = hours >= 12;
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  const daysInMonth = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: Array<{ day: number; isCurrentMonth: boolean }> = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }
    return days;
  }, [year, month]);

  const isDayDisabled = (dayNumber: number, isCurrent: boolean) => {
    if (!isCurrent) return true;
    if (!minDate) return false;

    const targetDate = new Date(year, month, dayNumber, 23, 59, 59);
    return targetDate.getTime() < minDate.getTime();
  };

  const updateDate = (newDay: number) => {
    const next = new Date(date);
    next.setFullYear(year, month, newDay);
    onChange(next);
  };

  const updateHours = (delta: number) => {
    const next = new Date(date);
    let currentH = next.getHours();
    currentH = (currentH + delta + 24) % 24;
    next.setHours(currentH);
    onChange(next);
  };

  const updateMinutes = (delta: number) => {
    const next = new Date(date);
    let currentM = next.getMinutes();
    currentM = (currentM + delta + 60) % 60;
    next.setMinutes(currentM);
    onChange(next);
  };

  const toggleAmPm = (targetPm: boolean) => {
    const next = new Date(date);
    let h = next.getHours();
    if (targetPm && h < 12) h += 12;
    if (!targetPm && h >= 12) h -= 12;
    next.setHours(h);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#71767b]">
          Event Date
        </span>
        <div className="mt-1 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">
            {date.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </h3>
          <span className="text-base font-bold text-[#d6f94a]">
            {date.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      <div className="border-t border-dashed border-[#2d3135]" />

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b2f33] bg-[#1a1c1e] hover:bg-[#25282c] transition"
        >
          <ChevronLeft className="h-4 w-4 text-white" />
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={month}
              onChange={(e) =>
                setViewDate(new Date(year, Number(e.target.value), 1))
              }
              className="appearance-none rounded-xl border border-[#2b2f33] bg-[#1a1c1e] py-2 pl-3 pr-8 text-xs font-bold text-white outline-none cursor-pointer"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71767b]" />
          </div>

          <div className="relative">
            <select
              value={year}
              onChange={(e) =>
                setViewDate(new Date(Number(e.target.value), month, 1))
              }
              className="appearance-none rounded-xl border border-[#2b2f33] bg-[#1a1c1e] py-2 pl-3 pr-8 text-xs font-bold text-white outline-none cursor-pointer"
            >
              {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#71767b]" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2b2f33] bg-[#1a1c1e] hover:bg-[#25282c] transition"
        >
          <ChevronRight className="h-4 w-4 text-white" />
        </button>
      </div>

      <div>
        <div className="grid grid-cols-7 text-center text-xs font-semibold text-[#8b939b] mb-2">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center text-xs font-bold">
          {daysInMonth.map(({ day, isCurrentMonth }, idx) => {
            const disabled = isDayDisabled(day, isCurrentMonth);
            const isSelected =
              isCurrentMonth &&
              day === selectedDay &&
              month === selectedMonth &&
              year === selectedYear;

            return (
              <button
                key={idx}
                type="button"
                disabled={disabled}
                onClick={() => updateDate(day)}
                className={`mx-auto flex h-9 w-9 items-center justify-center rounded-xl transition ${
                  isSelected
                    ? 'bg-[#d6f94a] text-black font-bold shadow-md'
                    : disabled
                      ? 'text-[#3d4246] opacity-40 cursor-not-allowed'
                      : 'text-white hover:bg-[#25282c]'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-[#232527] pt-4">
        <div className="flex items-center gap-2 rounded-2xl border border-[#2b2f33] bg-[#1a1c1e] px-3 py-2">
          <button
            type="button"
            onClick={() => updateHours(-1)}
            className="text-[#8b939b] hover:text-white transition"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-mono text-sm font-bold text-white">
            {String(displayHours).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => updateHours(1)}
            className="text-[#8b939b] hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <span className="text-sm font-bold text-[#8b939b]">:</span>

        <div className="flex items-center gap-2 rounded-2xl border border-[#2b2f33] bg-[#1a1c1e] px-3 py-2">
          <button
            type="button"
            onClick={() => updateMinutes(-5)}
            className="text-[#8b939b] hover:text-white transition"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-6 text-center font-mono text-sm font-bold text-white">
            {String(minutes).padStart(2, '0')}
          </span>
          <button
            type="button"
            onClick={() => updateMinutes(5)}
            className="text-[#8b939b] hover:text-white transition"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex rounded-2xl border border-[#2b2f33] bg-[#1a1c1e] p-1">
          <button
            type="button"
            onClick={() => toggleAmPm(false)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              !isPm ? 'bg-[#2f3337] text-white' : 'text-[#71767b]'
            }`}
          >
            AM
          </button>
          <button
            type="button"
            onClick={() => toggleAmPm(true)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
              isPm ? 'bg-[#2f3337] text-white' : 'text-[#71767b]'
            }`}
          >
            PM
          </button>
        </div>
      </div>
    </div>
  );
}
