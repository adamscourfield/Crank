import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Terminal, 
  ArrowRight, 
  Trash2, 
  AlertCircle, 
  BookOpen,
  X
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

function Login({ onLogin }: { onLogin: (password: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setIsVerifying(true);
    setError('');
    
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        onLogin(password);
      } else {
        setError(data.error || 'Access Denied.');
      }
    } catch (err) {
      setError('Connection failure.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-xs"
      >
        <div className="flex flex-col items-center gap-12">
          <h1 className="text-4xl font-bold tracking-[10px] text-neutral-900 leading-none font-logo">CRANK</h1>
          
          <form onSubmit={handleSubmit} className="w-full space-y-8">
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Access Key"
                className="w-full px-0 py-3 bg-transparent border-b border-neutral-200 text-center text-sm focus:outline-none focus:border-neutral-900 transition-all placeholder:text-neutral-300"
              />
            </div>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-4 bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-[0.4em] hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:bg-neutral-200"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Engine'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [password, setPassword] = useState<string | null>(localStorage.getItem('crank_session'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!password);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pastQueries, setPastQueries] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleLogin = (pw: string) => {
    localStorage.setItem('crank_session', pw);
    setPassword(pw);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('crank_session');
    setIsAuthenticated(false);
    setPassword(null);
  };

  // Persist Messages
  useEffect(() => {
    const saved = localStorage.getItem('crank_messages');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('crank_messages', JSON.stringify(messages));
  }, [messages]);

  // Inactivity sign-out (10 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 10 * 60 * 1000); // 10 minutes
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);

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
          chatHistory: messages,
          password
        }),
      });

      if (response.status === 401) {
        logout();
        throw new Error('Session Expired.');
      }

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

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col p-6 md:p-16 font-sans selection:bg-neutral-900 selection:text-white">
      {/* Header */}
      <header className="mb-16 max-w-7xl mx-auto w-full sticky top-0 bg-white/80 backdrop-blur-sm z-20 py-4 -mt-4">
        <h1 className="text-4xl font-bold tracking-[10px] leading-none text-neutral-900 font-logo">CRANK</h1>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row gap-20 max-w-7xl mx-auto w-full mb-16">
        
        {/* Left Panel: Capabilities (Clinical) */}
        <div className="w-full md:w-64 flex flex-col gap-12 shrink-0 md:sticky md:top-32 h-fit">
          <section>
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6 border-b border-neutral-100 pb-2">
              Data Sovereignty
            </h2>
            <ul className="text-[10px] font-bold space-y-3.5 text-neutral-900 uppercase tracking-tight">
              {[
                ["T1", "Safeguarding (KCSIE)"],
                ["T2", "Inspection (EIF 25)"],
                ["T3", "Employment (STPCD)"],
                ["T4", "SEND & Inclusion"],
                ["T5", "Attendance (2024)"],
                ["T6", "Finance (ATH 2026)"],
                ["T7", "Primary Statutes"],
                ["T8", "Data Protection"]
              ].map(([id, label]) => (
                <li key={id} className="flex items-center justify-between group">
                  <span className="text-neutral-300 group-hover:text-neutral-900 transition-colors mr-4">{id}</span>
                  <span className="flex-1 truncate">{label}</span>
                </li>
              ))}
            </ul>
          </section>

          {pastQueries.length > 0 && (
            <section className="animate-in fade-in duration-700">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-6 border-b border-neutral-100 pb-2">
                History
              </h2>
              <div className="flex flex-col gap-2">
                {pastQueries.slice(0, 5).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="w-full text-left text-[10px] font-bold text-neutral-400 hover:text-neutral-900 uppercase truncate transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Chat Interface (Minimal Terminal) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto space-y-20 pr-4 custom-scrollbar scroll-smooth"
          >
            <AnimatePresence initial={false}>
              {messages.length === 0 && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-start pt-20"
                >
                  <p className="text-neutral-300 text-xs font-bold uppercase tracking-[0.3em]">System Standby</p>
                  <p className="text-neutral-200 text-sm mt-2 italic font-medium">Awaiting input sequence...</p>
                </motion.div>
              )}
              {messages.map((m, i) => (
                <div key={i} className="flex flex-col gap-10">
                  {m.role === 'user' ? (
                    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-neutral-300">Inquiry</span>
                        <div className="flex-1 h-px bg-neutral-50" />
                      </div>
                      <p className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight leading-tight">
                        {m.text}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black tracking-[0.3em] uppercase text-neutral-300">Response</span>
                        <div className="flex-1 h-px bg-neutral-50" />
                        <span className="text-neutral-200 font-mono text-[8px] tracking-widest uppercase">ID: {i.toString().padStart(3, '0')}</span>
                      </div>
                      <div className="prose prose-sm md:prose-base">
                        <Markdown remarkPlugins={[remarkGfm]}>{m.text}</Markdown>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <div className="flex flex-col gap-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase text-neutral-200">Processing</span>
                  <div className="flex-1 h-px bg-neutral-50" />
                </div>
                <div className="space-y-3">
                  <div className="h-2 w-full bg-neutral-50 rounded" />
                  <div className="h-2 w-5/6 bg-neutral-50 rounded" />
                  <div className="h-2 w-4/6 bg-neutral-50 rounded" />
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={queryCrank} className="sticky bottom-0 bg-white pt-12 pb-2 z-10">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="State inquiry..."
              className="w-full bg-transparent border-b border-neutral-200 py-6 text-sm font-medium focus:outline-none focus:border-neutral-900 transition-all placeholder:text-neutral-200 tracking-tight"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-200 hover:text-neutral-900 disabled:text-neutral-100 transition-colors cursor-pointer"
            >
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="max-w-7xl mx-auto w-full flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-300 pt-8 border-t border-neutral-50">
        <div className="flex gap-8">
          <button onClick={logout} className="hover:text-neutral-900 transition-colors">Sign Out</button>
          <button 
            onClick={() => {
              setMessages([]);
              setPastQueries([]);
              localStorage.removeItem('crank_queries');
              localStorage.removeItem('crank_messages');
            }}
            className="hover:text-neutral-900 transition-colors"
          >
            Flush Data
          </button>
        </div>
        <div className="flex gap-8 items-center">
          <span className="flex items-center gap-1.5 grayscale opacity-50">
            <div className="w-1 h-1 rounded-full bg-neutral-900" />
            Core Secure
          </span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
