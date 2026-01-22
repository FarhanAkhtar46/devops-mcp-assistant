
import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Sprints } from './pages/Sprints';
import { AskDevOps } from './pages/AskDevOps';
import { CodeReviews } from './pages/CodeReviews';
import { KPIs } from './pages/KPIs';
import { Planning } from './pages/Planning';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sprints" element={<Sprints />} />
            <Route path="/reviews" element={<CodeReviews />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/ask" element={<AskDevOps />} />
            <Route path="/settings" element={<div className="p-8 text-center"><h2 className="text-2xl font-bold">System Settings</h2><p className="text-slate-500 mt-2">Configure API endpoints and integration preferences.</p></div>} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
