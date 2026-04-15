import React from 'react';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import { Briefcase } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
      
      <header className="relative z-10 border-b border-white/10 glass-panel sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500/20 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gradient">MatchAI PRO</h1>
          </div>
          <div className="text-sm text-textMuted flex items-center gap-4">
            <a href="#" className="hover:text-primary-500 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-primary-500 transition-colors">History</a>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all">Sign In</button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            AI-Powered Resume <span className="text-gradient">Screening</span>
          </h2>
          <p className="text-textMuted max-w-2xl mx-auto text-lg">
            Upload a resume and paste a Job Description. Our advanced logic will parse, match, and provide actionable improvement insights instantly.
          </p>
        </div>
        
        <ResumeAnalyzer />
      </main>
    </div>
  );
}

export default App;
