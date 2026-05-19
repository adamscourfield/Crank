import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Terminal, 
  ArrowRight, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  ShieldCheck, 
  BarChart3,
  Search
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pastQueries, setPastQueries] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('crank_queries');
    if (saved) setPastQueries(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('crank_queries', JSON.stringify(pastQueries));
  }, [pastQueries]);

  const queryCrank = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    
    // Add to past queries if unique
    if (!pastQueries.includes(input.trim())) {
      setPastQueries(prev => [input.trim(), ...prev].slice(0, 20));
    }

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/crank/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          chatHistory: messages 
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
         throw new Error(data.error || 'Server is shit.');
      }

      setMessages(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'model', text: err.message || 'Server is shit. Try later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] flex flex-col p-4 md:p-12 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="flex justify-between items-end mb-12 max-w-7xl mx-auto w-full">
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-black tracking-tighter leading-none text-neutral-900">CRANK</h1>
          <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-400 uppercase">School Intel Core</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono font-bold text-neutral-400 tracking-wider">PROTOCOL: ACTIVE</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row gap-12 max-w-7xl mx-auto w-full mb-12 overflow-hidden">
        
        {/* Left Panel: Capabilities (Clinical) */}
        <div className="w-full md:w-56 flex flex-col gap-6">
          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-4 border-b border-neutral-200 pb-1">
                Data Sovereignty
              </h2>
              <ul className="text-[11px] font-medium space-y-3 text-neutral-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>KCSiE / WTTSC 24</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>SEND DfE CODE</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>ATTENDANCE LAW</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>OFSTED EIF v4</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-neutral-300" />
                  <span>JCQ REGULATORY</span>
                </li>
              </ul>
            </section>

            <section className="mt-auto hidden md:block">
              <p className="text-[10px] text-neutral-400 leading-relaxed font-medium uppercase tracking-tight">
                Artificial Intelligence tuned for unflinching school leadership.
              </p>
            </section>

            {pastQueries.length > 0 && (
              <section className="mt-4 border-t border-neutral-100 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <h2 className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-4 border-b border-neutral-200 pb-1">
                  History log
                </h2>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  {pastQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(q)}
                      className="text-left text-[11px] text-neutral-500 hover:text-neutral-900 truncate bg-neutral-50/50 hover:bg-neutral-100 p-2 rounded transition-colors border border-transparent hover:border-neutral-200"
                      title={q}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Chat Interface (The "Lab" Console) */}
        <div className="flex-1 flex flex-col bg-white border border-neutral-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-xl overflow-hidden relative">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 bg-white"
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30 px-12"
                >
                  <p className="font-bold text-xs uppercase tracking-[0.3em] text-neutral-500 mb-2">System Ready</p>
                  <p className="text-neutral-400 text-sm max-w-xs leading-relaxed italic">State your problem.</p>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-3`}
                >
                  {m.role === 'user' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-[85%] p-3 px-4 rounded-xl bg-neutral-900 text-white shadow-sm"
                    >
                      <div className="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-white/40 uppercase">Inquiry</span>
                      </div>
                      <div className="text-[13px] md:text-sm font-normal prose prose-sm max-w-none prose-invert-white">
                        <Markdown>{m.text}</Markdown>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col gap-4 w-full items-start pl-2 md:pl-4 border-l-2 border-neutral-50 py-1">
                      <div className="lab-response-marker w-full">Intel Core</div>
                      {m.text.split(/\n\n+/).filter(chunk => chunk.trim()).map((chunk, j) => (
                        <motion.div
                          key={`${i}-${j}`}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            delay: j * 0.1, 
                            duration: 0.5, 
                            ease: [0.23, 1, 0.32, 1] 
                          }}
                          className="max-w-full text-neutral-800"
                        >
                          <div className="text-[13px] md:text-[14px] font-medium prose prose-neutral max-w-none leading-relaxed">
                            <Markdown>{chunk.trim()}</Markdown>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 flex gap-1.5 items-center">
                  <div className="w-1 h-1 bg-neutral-300 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-neutral-300 animate-pulse" style={{ animationDelay: '200ms' }} />
                  <div className="w-1 h-1 bg-neutral-300 animate-pulse" style={{ animationDelay: '400ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={queryCrank} className="p-4 md:p-6 bg-white border-t border-neutral-100">
            <div className="relative flex items-center bg-neutral-50 rounded-2xl border border-neutral-200 transition-all focus-within:border-neutral-400 focus-within:bg-white focus-within:shadow-sm">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="..."
                className="flex-1 px-5 py-4 text-sm font-medium focus:outline-none placeholder:text-neutral-300"
              />
              <button 
                type="submit"
                disabled={isLoading || !input.trim()}
                className="mr-2 p-3 bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 disabled:bg-neutral-200 disabled:text-neutral-400 transition-all active:scale-95"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="max-w-7xl mx-auto w-full flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-neutral-400 border-t border-neutral-100 pt-6">
        <button 
          onClick={() => {
            setMessages([]);
            setPastQueries([]);
            localStorage.removeItem('crank_queries');
          }}
          className="hover:text-neutral-900 transition-colors uppercase cursor-pointer"
        >
          Flush Data Buffer
        </button>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            Core Secure
          </span>
          <span>© CRANK INTEL 2026</span>
        </div>
      </footer>
    </div>
  );
}
