
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, Cell, PieChart, Pie
} from 'recharts';
import { Target, Flag, Zap, Clock, ChevronDown, Filter } from 'lucide-react';

const mockSprints = [
  { id: '1', name: 'Sprint 24.1: Auth Refactor', status: 'completed' },
  { id: '2', name: 'Sprint 24.2: Payment Gateway', status: 'active' },
  { id: '3', name: 'Sprint 24.3: Analytics Engine', status: 'planning' },
];

const mockBurndown = [
  { day: 'Day 1', remaining: 100, ideal: 100 },
  { day: 'Day 2', remaining: 92, ideal: 90 },
  { day: 'Day 3', remaining: 85, ideal: 80 },
  { day: 'Day 4', remaining: 70, ideal: 70 },
  { day: 'Day 5', remaining: 65, ideal: 60 },
  { day: 'Day 6', remaining: 50, ideal: 50 },
  { day: 'Day 7', remaining: 45, ideal: 40 },
  { day: 'Day 8', remaining: 30, ideal: 30 },
  { day: 'Day 9', remaining: 15, ideal: 20 },
  { day: 'Day 10', remaining: 0, ideal: 10 },
];

const mockMemberCapacity = [
  { name: 'Sarah', capacity: 40, assigned: 38 },
  { name: 'James', capacity: 40, assigned: 42 },
  { name: 'Emily', capacity: 35, assigned: 25 },
  { name: 'Marcus', capacity: 40, assigned: 40 },
  { name: 'Olivia', capacity: 20, assigned: 18 },
];

export const Sprints: React.FC = () => {
  const [selectedSprint, setSelectedSprint] = useState(mockSprints[1]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Sprint Insights</h2>
          <p className="text-slate-500">Analyze performance and capacity for current iteration</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 text-sm font-semibold hover:border-azure-500 transition-colors">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              {selectedSprint.name}
              <ChevronDown size={16} />
            </button>
          </div>
          <button className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl hover:text-slate-800 transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Progress', value: '68%', icon: Target, color: 'azure' },
          { label: 'Completed', value: '24/38', icon: Flag, color: 'emerald' },
          { label: 'Velocity', value: '52 pts', icon: Zap, color: 'amber' },
          { label: 'Days Left', value: '4 days', icon: Clock, color: 'rose' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Burndown Chart */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-xl font-bold mb-6">Burndown Chart</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockBurndown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="remaining" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#0ea5e9' }} activeDot={{ r: 6 }} name="Remaining Effort" />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Ideal Burndown" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Capacity Breakdown */}
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50">
          <h3 className="text-xl font-bold mb-6">Member Capacity</h3>
          <div className="space-y-6">
            {mockMemberCapacity.map((member, i) => {
              const percentage = (member.assigned / member.capacity) * 100;
              const isOver = percentage > 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{member.name}</span>
                    <span className={`font-mono ${isOver ? 'text-rose-500 font-bold' : 'text-slate-500'}`}>
                      {member.assigned}h / {member.capacity}h
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 rounded-full ${isOver ? 'bg-rose-500' : 'bg-azure-500'}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 bg-azure-50 dark:bg-azure-900/10 rounded-2xl border border-azure-100 dark:border-azure-900/20 flex items-start gap-3">
            <Zap className="text-azure-600 shrink-0" size={20} />
            <p className="text-xs text-azure-800 dark:text-azure-300 leading-relaxed">
              <span className="font-bold">AI Insight:</span> James is currently over capacity by 5%. Consider shifting 4 hours of low-priority tasks to Emily to balance the load.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
