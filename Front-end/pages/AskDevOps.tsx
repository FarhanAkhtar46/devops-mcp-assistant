
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCcw, Paperclip } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AskDevOps: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your DevOps AI assistant. Ask me anything about your sprints, code reviews, or team performance.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    
    setIsTyping(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Based on current sprint data, your velocity has increased by 12% this week. However, Sarah's team is currently blocked on the 'OAuth2 implementation' which might impact the milestone scheduled for Friday. I recommend reassigning task DEV-102 to James who has capacity.`,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            Ask DevOps Assistant
            <Sparkles className="text-azure-500" size={24} />
          </h2>
          <p className="text-slate-500">Get AI-powered insights from your Azure DevOps data</p>
        </div>
        <button 
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Reset Conversation"
        >
          <RefreshCcw size={20} />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-3xl p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'assistant' 
              ? 'bg-azure-600 text-white' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {msg.role === 'assistant' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`max-w-[80%] p-4 rounded-3xl ${
              msg.role === 'assistant'
              ? 'bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-100 rounded-tl-none'
              : 'bg-azure-600 text-white rounded-tr-none'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-2xl bg-azure-600/20 flex items-center justify-center shrink-0">
              <Bot size={20} className="text-azure-400" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-3xl border border-slate-100 dark:border-slate-700/50 rounded-tl-none w-24 flex justify-center gap-1">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="mt-6 relative">
        <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus-within:border-azure-500 rounded-3xl transition-all shadow-lg overflow-hidden flex items-center">
          <button type="button" className="p-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about sprint velocity, PR blockers, or environment status..."
            className="flex-1 bg-transparent border-none focus:ring-0 py-5 text-slate-800 dark:text-white placeholder:text-slate-400"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isTyping}
            className={`mr-3 p-3 rounded-2xl transition-all ${
              input.trim() && !isTyping 
              ? 'bg-azure-600 text-white shadow-lg shadow-azure-900/20 hover:scale-105 active:scale-95' 
              : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-bold">
          Powered by GPT-4o-Mini • Enterprise Managed Context
        </p>
      </form>
    </div>
  );
};
