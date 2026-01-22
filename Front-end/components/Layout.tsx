
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarRange, 
  GitPullRequest, 
  ClipboardList, 
  Activity, 
  MessageSquare, 
  Settings,
  Sun,
  Moon,
  ChevronRight,
  User,
  Bell
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const sidebarItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/sprints', label: 'Sprints', icon: CalendarRange },
  { path: '/reviews', label: 'Code Reviews', icon: GitPullRequest },
  { path: '/planning', label: 'Planning', icon: ClipboardList },
  { path: '/kpis', label: 'KPIs', icon: Activity },
  { path: '/ask', label: 'Ask DevOps', icon: MessageSquare },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-azure-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
          <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">AzureAssist</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                  ? 'bg-azure-50 dark:bg-azure-900/20 text-azure-600 dark:text-azure-400 font-medium' 
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-azure-600 dark:text-azure-400' : ''} />
                <span>{item.label}</span>
                {isActive && <ChevronRight size={16} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white truncate">
              {sidebarItems.find(i => i.path === location.pathname)?.label || 'Overview'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 dark:border-slate-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-800 dark:text-white">Alex Johnson</p>
                <p className="text-xs text-slate-500">Sr. DevOps Engineer</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-tr from-azure-600 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                AJ
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
};
