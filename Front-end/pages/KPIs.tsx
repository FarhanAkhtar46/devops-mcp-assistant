
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Calendar, 
  ChevronRight,
  Zap,
  Shield,
  Server,
  Users,
  Search,
  X
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const mockSparklineData = [
  { val: 400 }, { val: 300 }, { val: 500 }, { val: 450 }, { val: 600 }, { val: 550 }, { val: 700 }
];

const KPI_LIST = [
  { id: '1', label: 'API Latency', value: '42ms', trend: -12, status: 'Healthy', category: 'Performance', icon: Zap },
  { id: '2', label: 'Error Rate', value: '0.04%', trend: 2, status: 'Healthy', category: 'Reliability', icon: Shield },
  { id: '3', label: 'System Uptime', value: '99.99%', trend: 0, status: 'Healthy', category: 'Infrastructure', icon: Server },
  { id: '4', label: 'Deployment Frequency', value: '14/day', trend: 8, status: 'Healthy', category: 'DevOps', icon: Activity },
  { id: '5', label: 'Active Sessions', value: '1,240', trend: 15, status: 'Stable', category: 'Usage', icon: Users },
];

export const KPIs: React.FC = () => {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState<typeof KPI_LIST[0] | null>(null);

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header with Filters & Refresh */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Real-time KPIs
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live
            </div>
          </h2>
          <p className="text-slate-500">Monitoring core system metrics and deployment health</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm">
            <Calendar size={16} className="text-slate-400 mr-2" />
            <span className="font-medium">Last 24 Hours</span>
          </div>
          
          <button 
            onClick={refreshData}
            className={`flex items-center gap-2 px-4 py-2 bg-azure-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-azure-900/20 hover:bg-azure-500 transition-all ${isRefreshing ? 'opacity-70' : ''}`}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
          </button>
          
          <div className="text-xs text-slate-400 font-mono">
            Last update: {lastRefreshed.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {KPI_LIST.map((kpi) => (
          <div 
            key={kpi.id} 
            onClick={() => setSelectedKpi(kpi)}
            className="group cursor-pointer bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 hover:border-azure-500 transition-all hover:shadow-xl hover:shadow-azure-500/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:text-azure-500 group-hover:bg-azure-50 dark:group-hover:bg-azure-900/20 transition-colors">
                <kpi.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${kpi.trend < 0 ? 'text-emerald-500' : kpi.trend > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                {kpi.trend !== 0 && (kpi.trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />)}
                {kpi.trend === 0 ? 'Stable' : `${Math.abs(kpi.trend)}%`}
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <h4 className="text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</h4>
                <span className="text-xs font-bold text-emerald-500">{kpi.status}</span>
              </div>
            </div>

            <div className="mt-6 h-12">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={mockSparklineData}>
                   <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={kpi.trend < 0 ? '#10b981' : kpi.trend > 0 ? '#f43f5e' : '#0ea5e9'} 
                    fill={kpi.trend < 0 ? '#10b98120' : kpi.trend > 0 ? '#f43f5e20' : '#0ea5e920'} 
                    strokeWidth={2} 
                   />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            
            <button className="w-full mt-6 py-2 flex items-center justify-center gap-2 text-xs font-bold text-slate-400 group-hover:text-azure-500 transition-colors">
              VIEW DRILL-DOWN <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Detailed Analysis Section */}
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="p-8 border-b border-slate-200 dark:border-slate-700/50">
          <h3 className="text-xl font-bold">Historical Performance Comparison</h3>
        </div>
        <div className="p-8 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { time: '00:00', api: 45, db: 32 },
              { time: '04:00', api: 30, db: 25 },
              { time: '08:00', api: 85, db: 45 },
              { time: '12:00', api: 120, db: 60 },
              { time: '16:00', api: 95, db: 50 },
              { time: '20:00', api: 55, db: 35 },
              { time: '23:59', api: 40, db: 30 },
            ]}>
              <defs>
                <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="api" name="API Calls" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorApi)" strokeWidth={3} />
              <Area type="monotone" dataKey="db" name="DB Queries" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorDb)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Drill-down Modal (Conditional) */}
      {selectedKpi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-azure-50 dark:bg-azure-900/20 text-azure-600 rounded-2xl">
                  <selectedKpi.icon size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedKpi.label} Details</h3>
                  <p className="text-sm text-slate-500">Metric Drill-down & Correlation Analysis</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedKpi(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Peak Value</p>
                  <p className="text-xl font-bold">120ms</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Average</p>
                  <p className="text-xl font-bold">{selectedKpi.value}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">P99</p>
                  <p className="text-xl font-bold">85ms</p>
                </div>
              </div>
              
              <div className="p-6 border border-azure-100 dark:border-azure-900/30 bg-azure-50/30 dark:bg-azure-900/10 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-azure-600 font-bold text-sm">
                  <Zap size={16} /> AI Correlation
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We detected a correlation between this spike and the <span className="text-azure-600 font-semibold">Database Migration (PR-452)</span>. 
                  Latency returned to normal 12 minutes after the migration finished. No action required.
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedKpi(null)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl hover:opacity-90 transition-opacity"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
