'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export interface ChartDataPoint {
  name: string;
  passes: number;
}

interface EventGraphProps {
  isGate?: boolean;
  data?: ChartDataPoint[];
}
const defaultData: ChartDataPoint[] = [
  { name: 'May', passes: 2 },
  { name: 'Jun', passes: 4 },
  { name: 'Jul', passes: 3 },
  { name: 'Aug', passes: 7 },
  { name: 'Sep', passes: 5 },
  { name: 'Oct', passes: 9 },
];

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  label?: string;
}) {
  if (active && payload && payload.length) {
    const value = payload[0].value ?? 0;
    return (
      <div className="rounded-2xl border border-[#dce1d5] bg-[#17211b] p-3 shadow-lg text-white">
        <p className="text-xs font-semibold text-[#8f968c] uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-sm font-bold text-[#d6f94a]">
          {value} {value === 1 ? 'Pass' : 'Passes'} Acquired
        </p>
      </div>
    );
  }
  return null;
}

export function EventGraph({
  isGate = false,
  data = defaultData,
}: EventGraphProps) {
  const chartData = data.length > 0 ? data : defaultData;

  return (
    <div className="rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#6d766d]">
            {isGate ? 'Scan Terminal Volume' : 'Pass Activity'}
          </span>
          <h3 className="text-lg font-bold text-[#17211b] mt-0.5">
            {isGate ? 'Gate Check-in Trends' : 'Monthly Ticket Activity'}
          </h3>
        </div>
        <span className="rounded-full bg-[#d6f94a] px-3 py-1 text-xs font-bold text-[#17211b]">
          Live Analytics
        </span>
      </div>

      <div className="h-65 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="passGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d6f94a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#d6f94a" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e8ebe3"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6d766d', fontSize: 12, fontWeight: 600 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6d766d', fontSize: 12, fontWeight: 600 }}
              allowDecimals={false}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="passes"
              stroke="#17211b"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#passGradient)"
              activeDot={{
                r: 6,
                fill: '#d6f94a',
                stroke: '#17211b',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
