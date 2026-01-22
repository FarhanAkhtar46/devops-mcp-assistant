
import React from 'react';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon: LucideIcon;
  description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, trend, icon: Icon, description }) => {
  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-azure-50 dark:bg-azure-900/20 rounded-xl text-azure-600 dark:text-azure-400 group-hover:scale-110 transition-transform">
          <Icon size={24} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
            {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 uppercase tracking-wider">{label}</h3>
        <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
        {description && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{description}</p>}
      </div>
    </div>
  );
};
