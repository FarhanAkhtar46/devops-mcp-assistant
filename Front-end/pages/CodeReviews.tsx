
import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { 
  GitPullRequest, 
  Clock, 
  CheckCircle, 
  Filter, 
  AlertCircle,
  Search,
  ChevronDown
} from 'lucide-react';
import { MetricCard } from '../components/common/MetricCard';

const mockEfficiencyData = [
  { date: 'Mon', avgTime: 4.2 },
  { date: 'Tue', avgTime: 3.8 },
  { date: 'Wed', avgTime: 5.1 },
  { date: 'Thu', avgTime: 2.9 },
  { date: 'Fri', avgTime: 3.2 },
  { date: 'Sat', avgTime: 2.1 },
  { date: 'Sun', avgTime: 1.8 },
];

const mockDeveloperData = [
  { name: 'Sarah', prs: 12, comments: 45 },
  { name: 'James', prs: 9, comments: 32 },
  { name: 'Emily', prs: 15, comments: 58 },
  { name: 'Marcus', prs: 7, comments: 24 },
  { name: 'Olivia', prs: 11, comments: 41 },
];

const PR_STATUSES = [
  { id: 'all', label: 'All PRs', count: 48 },
  { id: 'approved', label: 'Approved', count: 28, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'in_review', label: 'In Review', count: 15, color: 'text-azure-500', bg: 'bg-azure-50 dark:bg-azure-500/10' },
  { id: 'blocked', label: 'Blocked', count: 5, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
];

export const CodeReviews: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Code Review Analytics</h2>
          <p className="text-slate-500">Monitor pull request health and team review efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-azure-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search PRs..." 
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-azure-500 outline-none transition-all w-64"
            />
          </div>
          <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm font-semibold hover:border-azure-500 transition-colors">
            Last 14 Days
            <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Total Pull Requests" value="48" icon={GitPullRequest} trend={14} />
        <MetricCard label="Avg. Review Time" value="3.4h" icon={Clock} trend={-12} description="Hours from open to first review" />
        <MetricCard label="Approval Rate" value="92%" icon={CheckCircle} trend={5} />
      </div>

      {/* Status Filters Bar */}
      <div className="flex flex-wrap gap-4">
        {PR_STATUSES.map((status) => (
          <button
            key={status.id}
            onClick={() => setActiveFilter(status.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all duration-200 ${
              activeFilter === status.id
                ? 'border-azure-500 bg-azure-50 dark:bg-azure-900/20 text-azure-700 dark:text-azure-300 ring-2 ring-azure-500/20 shadow-lg'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <span className={`font-bold ${status.color || 'text-slate-700 dark:text-slate-200'}`}>
              {status.count}
            </span>
            <span className="text-sm font-medium">{status.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency Trend Line Chart */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Review Efficiency</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="w-3 h-3 rounded-full bg-azure-500"></span>
              Avg. Hours
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockEfficiencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgTime" 
                  stroke="#0ea5e9" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 3, stroke: '#fff' }} 
                  activeDot={{ r: 8, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Developer Patterns Bar Chart */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8">Participation by Developer</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDeveloperData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#33415510" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="prs" radius={[0, 8, 8, 0]} barSize={20} name="PRs Reviewed">
                  {mockDeveloperData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0ea5e9' : '#06b6d4'} />
                  ))}
                </Bar>
                <Bar dataKey="comments" radius={[0, 8, 8, 0]} barSize={20} fill="#94a3b830" name="Comments Given" />
                <Legend iconType="circle" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Critical Blockers Table-like section */}
      <div className="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
          <h3 className="text-xl font-bold">Attention Required</h3>
          <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full uppercase tracking-wider">
            5 Blocked PRs
          </span>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[
            { id: 'PR-1024', title: 'Update Auth Schema to support MFA', author: 'Sarah M.', status: 'Blocked', time: '2 days ago', priority: 'High' },
            { id: 'PR-1025', title: 'Refactor Billing Middleware', author: 'Marcus V.', status: 'Waiting', time: '18 hours ago', priority: 'Medium' },
            { id: 'PR-1027', title: 'Cloudflare Worker Deployment Script', author: 'Olivia P.', status: 'Blocked', time: '5 hours ago', priority: 'High' },
          ].map((pr) => (
            <div key={pr.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${pr.status === 'Blocked' ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'}`}>
                <AlertCircle size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-azure-600 uppercase tracking-wider">{pr.id}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{pr.title}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><User size={12} /> {pr.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {pr.time}</span>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${pr.priority === 'High' ? 'text-rose-600 bg-rose-50 dark:bg-rose-950' : 'text-amber-600 bg-amber-50 dark:bg-amber-950'}`}>
                  {pr.priority} Priority
                </div>
                <p className="text-[10px] text-slate-400 mt-1">First review pending</p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-full p-4 text-sm font-semibold text-azure-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-t border-slate-200 dark:border-slate-700/50">
          View all Pull Requests
        </button>
      </div>
    </div>
  );
};

const User = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
