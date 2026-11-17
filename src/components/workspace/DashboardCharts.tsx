import React from 'react';

interface DonutRingChartProps {
  percent: number;
  label: string;
  sublabel?: string;
  color?: string;
  size?: number;
}

export const DonutRingChart: React.FC<DonutRingChartProps> = ({
  percent,
  label,
  sublabel,
  color = '#123D32',
  size = 104,
}) => {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safePercent / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-heading font-extrabold text-[#18221F] tabular-nums">
            {safePercent}%
          </span>
        </div>
      </div>
      <div className="min-w-0">
        <div className="text-sm font-heading font-bold text-[#18221F]">{label}</div>
        {sublabel && <div className="text-xs text-[#64748B] mt-0.5 leading-snug">{sublabel}</div>}
      </div>
    </div>
  );
};

interface BarItem {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  suffix?: string;
}

export const MiniBarChart: React.FC<{
  items: BarItem[];
  emptyMessage?: string;
}> = ({ items, emptyMessage = 'No recorded activity yet.' }) => {
  if (!items.length) {
    return <div className="text-xs text-[#64748B] py-4">{emptyMessage}</div>;
  }
  const computedMax = Math.max(...items.map((i) => i.maxValue ?? i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.max(0, Math.min(100, Math.round((item.value / (item.maxValue ?? computedMax)) * 100)));
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs gap-2">
              <span className="font-medium text-[#18221F] truncate">{item.label}</span>
              <span className="font-semibold text-[#64748B] tabular-nums shrink-0">
                {item.value.toLocaleString()}
                {item.suffix || ''}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#F5F5F2] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: item.color || '#2563EB',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const TrendLineChart: React.FC<{
  points: Array<{ label: string; value: number }>;
  strokeColor?: string;
  emptyMessage?: string;
}> = ({ points, strokeColor = '#123D32', emptyMessage = 'Activity history will appear here once recorded.' }) => {
  if (!points.length) {
    return <div className="text-xs text-[#64748B] py-6 text-center">{emptyMessage}</div>;
  }

  const width = 420;
  const height = 140;
  const padX = 16;
  const padY = 18;
  const maxVal = Math.max(...points.map((p) => p.value), 1);

  const coords = points.map((p, idx) => {
    const x =
      points.length === 1
        ? width / 2
        : padX + (idx / (points.length - 1)) * (width - padX * 2);
    const y = height - padY - (p.value / maxVal) * (height - padY * 2);
    return { x, y, ...p };
  });

  const polylineStr = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaStr = `${coords[0].x},${height - padY} ${polylineStr} ${coords[coords.length - 1].x},${height - padY}`;

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-36 overflow-visible">
        <defs>
          <linearGradient id="ofTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="#E2E8F0"
          strokeWidth="1"
        />
        {coords.length > 1 && <polygon points={areaStr} fill="url(#ofTrendGrad)" />}
        {coords.length > 1 && (
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylineStr}
          />
        )}
        {coords.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="4" fill="#FFFFFF" stroke={strokeColor} strokeWidth="2.5" />
          </g>
        ))}
      </svg>
      <div className="flex items-center justify-between text-[10px] text-[#64748B] px-1">
        {points.map((p, idx) => (
          <span key={idx} className="truncate max-w-[60px] text-center">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
};
