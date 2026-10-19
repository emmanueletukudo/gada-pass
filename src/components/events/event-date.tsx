import { Calendar } from 'lucide-react';

export function EventDateDisplay({
  startsAt,
  endsAt,
}: {
  startsAt: string;
  endsAt?: string;
}) {
  const startDate = new Date(startsAt);
  const endDate = endsAt ? new Date(endsAt) : null;

  const isMultiDay =
    endDate &&
    (startDate.getFullYear() !== endDate.getFullYear() ||
      startDate.getMonth() !== endDate.getMonth() ||
      startDate.getDate() !== endDate.getDate());

  const formattedStartDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedEndDate = endDate
    ? endDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#dce1d5] bg-[#fffef9] px-3.5 py-2 text-xs font-bold text-[#17211b] shadow-xs">
      <Calendar className="h-4 w-4 text-[#ff5500] shrink-0" />
      <span>
        {isMultiDay ? (
          <>
            <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mr-1">
              From
            </span>
            {formattedStartDate}
            <span className="text-[10px] uppercase font-semibold text-[#6d766d] tracking-wider mx-1">
              to
            </span>
            {formattedEndDate}
          </>
        ) : (
          formattedStartDate
        )}
      </span>
    </div>
  );
}
