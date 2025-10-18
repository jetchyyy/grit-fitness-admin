import type { ComponentType } from 'react';

interface AnalyticsCardProps {
  icon: ComponentType<any>;
  value: number;
  label: string;
  iconColor: string;
  borderColor: string;
  badge?: string;
}

export function AnalyticsCard({
  icon: Icon,
  value,
  label,
  iconColor,
  borderColor,
  badge
}: AnalyticsCardProps) {
  return (
    <div className={`bg-gray-900 rounded-lg p-6 border ${borderColor}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-8 h-8 ${iconColor}`} />
        {badge && <span className="text-gray-400 text-sm">{badge}</span>}
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}