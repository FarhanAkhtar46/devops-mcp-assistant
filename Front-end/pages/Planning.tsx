
import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  LayoutList, 
  Users, 
  ChevronRight, 
  BrainCircuit,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';

const mockBacklog = [
  { id: 'DEV-842', title: 'Implement OAuth2 PKCE Flow', effort: 8, priority: 'High', aiSuggestion: 'Immediate Start', confidence: 92 },
  { id: 'DEV-845', title: 'Refactor Legacy Billing Logic', effort: 13, priority: 'Medium', aiSuggestion: 'Break into 3 tasks', confidence: 85 },
  { id: 'DEV-849', title: 'Update AWS Lambda Runtime', effort: 3, priority: 'Low', aiSuggestion: 'Good filler task', confidence: 98 },
  { id: 'DEV-852', title: 'Add Prometheus Export for API', effort: 5, priority: 'High', aiSuggestion: 'Critical for Q3 Goals', confidence: 89 },
];

const mockHistoricalVelocity = [
  { sprint: 'S23.4', velocity: 42 },
  { sprint: 'S23.5', velocity: 48 },
  { sprint: 'S24.1', velocity: 52 },
  { sprint: 'S24.2', velocity: 45 },
  { sprint: 'S24.3', velocity: 58 },
];

export const Planning: React.FC = () => {
  const totalCapacity = 60;
  const estimatedLoad = 48;
  const utilization = (estimatedLoad / totalCapacity) * 100;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            Sprint Planning Support
            <div className="px-3 py-1 bg-azure-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-lg shadow-azure-900/20">
              AI Powered
            </div>
          </h2>
          <p className="text-slate-500">Forecasting capacity and optimizing backlog prioritization</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-azure-600 text-white rounded-2xl font-bold shadow-xl shadow-azure-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Zap size={18} />
          Finalize Sprint Plan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Recommendations Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-azure-600 to-azure-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <BrainCircuit size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                  <Sparkles size={20} />
                </div>
                <span className="font-bold text-lg">AI Planning Advice</span>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <p className="text-sm leading-relaxed">
                    "Historical data suggests your team is 15% more efficient on <span className="font-bold">Backend Refactoring</span> during mornings. Schedule the Auth Refactor early next week."
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-1 text-amber-300">
                    <AlertTriangle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Capacity Risk</span>
                  </div>
                  <p className="text-sm">James has 3 PTO days next sprint. Reduced velocity expected (Approx -8 points).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Indicator */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700/50">
            <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
              Sprint Health
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Optimal</span>
            </h3>
            
            <div className="space-y-6">
              <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-azure-500 rounded-full transition-all duration-1000"
                  style={{ width: `${utilization}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">Estimated Load</p>
                  <p className="text-2xl font-bold">{estimatedLoad} pts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 font-bold uppercase">Team Capacity</p>
                  <p className="text-2xl font-bold">{totalCapacity} pts</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Load is 80% of capacity. (Safe margin)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast & Backlog */}
        <div className="lg:col-span-2 space-y-8">
          {/* Historical Velocity Chart */}
          <div className="bg-white dark:bg-slate-800/50 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">Velocity Forecasting</h3>
                <p className="text-sm text-slate-500">Predicted performance based on historical trends</p>
              </div>
              <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-azure-600">
                Avg: 49 pts
              </div>
            </div>
            
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockHistoricalVelocity}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415510" />
                  <XAxis dataKey="sprint" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="velocity" fill="#0ea5e9" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Backlog Items */}
          <div className="bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-200 dark:border-slate-700/50 flex justify-between items-center">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Suggested for Sprint
                <span className="text-xs bg-azure-50 text-azure-600 dark:bg-azure-900/20 px-2 py-1 rounded-md font-bold">TOP 4</span>
              </h3>
              <button className="text-sm font-bold text-azure-600 hover:text-azure-700 transition-colors">
                View All Backlog
              </button>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockBacklog.map((item) => (
                <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all flex items-center gap-6 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 font-bold text-xs text-slate-500 group-hover:bg-azure-600 group-hover:text-white transition-all">
                    {item.effort}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-azure-600/60 uppercase tracking-widest">{item.id}</span>
                      <h4 className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{item.title}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold italic">
                        <Sparkles size={12} />
                        {item.aiSuggestion}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Users size={12} /> Unassigned
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      AI Confidence
                      <span className="text-azure-600">{item.confidence}%</span>
                    </div>
                    <div className="h-1.5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-azure-500 rounded-full" 
                        style={{ width: `${item.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button className="p-2 text-slate-300 hover:text-azure-600 hover:bg-azure-50 dark:hover:bg-azure-900/20 rounded-xl transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
