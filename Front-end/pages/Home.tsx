import React, { useEffect, useState } from 'react';
import { MetricCard } from '../components/common/MetricCard';
import { 
  Users, 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  PlusCircle,
  MessageSquare,
  ArrowRight,
  // Fix: Added missing icon imports used in the component
  CalendarRange,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { fetchDashboard } from '../services/api';

const mockChartData = [
  { name: 'Mon', velocity: 45, prs: 12 },
  { name: 'Tue', velocity: 52, prs: 19 },
  { name: 'Wed', velocity: 48, prs: 15 },
  { name: 'Thu', velocity: 61, prs: 22 },
  { name: 'Fri', velocity: 55, prs: 18 },
  { name: 'Sat', velocity: 40, prs: 8 },
  { name: 'Sun', velocity: 38, prs: 5 },
];

export const Home: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then(data => {
        setDashboard(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data.');
        setLoading(false);
      });
  }, []);

  // Fallback to mock data if backend is not available
  const welcome = dashboard?.welcome || { user: 'Alex Johnson', role: 'Sr. DevOps Engineer', message: 'The sprint planning for "Q3-Refactor-Week-4" is looking solid. You have 3 code reviews pending and the system health is optimal.' };
  const stats = dashboard?.stats || { activeSprints: 4, openPRs: 28, completedItems: 142, avgResolution: 3.4, velocityTrend: [] };
  const activityFeed = dashboard?.activityFeed || [];

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-azure-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-3">Welcome back, {welcome.user}! 👋</h2>
          <p className="text-azure-100 text-lg mb-6 leading-relaxed">
            {welcome.message}
          </p>
          <div className="flex gap-4">
            <button className="bg-white text-azure-600 px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 hover:bg-azure-50 transition-colors shadow-lg shadow-azure-900/20">
              <PlusCircle size={20} />
              New Sprint
            </button>
            <button className="bg-azure-500/50 backdrop-blur-sm text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-azure-400/50 transition-colors border border-azure-400/30">
              View Reports
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-teal-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Active Sprints" value={stats.activeSprints} icon={CalendarRange} />
        <MetricCard label="Open PRs" value={stats.openPRs} icon={GitBranch} />
        <MetricCard label="Completed Items" value={stats.completedItems} icon={CheckCircle2} />
        <MetricCard label="Avg. Resolution" value={stats.avgResolution + 'h'} icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Progress Chart (real data) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Velocity Trend</h3>
              <p className="text-sm text-slate-500">Weekly performance tracking across teams</p>
            </div>
            <select className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-azure-500">
              <option>Last 7 Weeks</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.velocityTrend}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Area type="monotone" dataKey="completed" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorVelocity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h3>
          <div className="space-y-6 flex-1">
            {activityFeed.length === 0 && <div className="text-slate-400">No recent activity.</div>}
            {activityFeed.map((item: any, idx: number) => {
              // Compose a simple label for each activity type
              let icon = <Users size={18} />;
              let label = '';
              let time = item.timestamp || item.time || '';
              if (item.type === 'pr') {
                icon = <GitBranch size={18} />;
                label = item.title || 'Pull Request';
              } else if (item.type === 'workitem') {
                icon = <CheckCircle2 size={18} />;
                label = item.title || 'Work Item';
              } else if (item.type === 'sprint') {
                icon = <CalendarRange size={18} />;
                label = item.title || 'Sprint';
              } else if (item.type === 'alert') {
                icon = <Activity size={18} />;
                label = item.title || 'Alert';
              }
              return (
                <div key={item.id || idx} className="flex gap-4 group cursor-pointer">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-azure-100 text-azure-600 dark:bg-azure-900/30">
                    {icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">{time}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-azure-600 hover:text-azure-700 transition-colors w-full p-3 rounded-xl hover:bg-azure-50 dark:hover:bg-azure-900/10">
            View All Activity
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
