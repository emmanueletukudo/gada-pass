import { FC } from 'react';

type MetricCardProps = {
  title: string;
  accent?: string;
  metric: string;
  metricLabel: string;
};

export const MetricCard: FC<MetricCardProps> = ({
  accent,
  metric,
  title,
  metricLabel,
}) => {
  return (
    <div
      className={`rounded-2xl p-6 @container ${!accent ? 'border border-[#dce1d5] bg-[#fffef9] animate-in fade-in' : ''}`}
      style={{ background: accent }}
    >
      <p
        className={`text-xs font-bold uppercase tracking-[0.15em] ${!accent ? 'text-[#6d766d]' : ''}`}
      >
        {title}
      </p>
      <p
        className="display mt-8 font-bold tracking-[-0.08em] whitespace-nowrap"
        style={{ fontSize: 'clamp(1.5rem, 12cqw, 3rem)' }}
      >
        {metric}
      </p>

      <p className="mt-2 text-sm font-semibold">{metricLabel}</p>
    </div>
  );
};
