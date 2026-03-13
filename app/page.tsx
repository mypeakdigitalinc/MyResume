'use client';

import Hero from '@/components/Hero';
import TechStack from '@/components/TechStack';
import SkillsExperience from '@/components/SkillsExperience';
import ChatWidget from '@/components/ChatWidget';

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-dark">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-brand-dark/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">
            JT<span className="text-brand-accent">.</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-brand-text/60">
            <a href="#" className="hover:text-brand-accent transition-colors">Home</a>
            <a href="#tech-stack" className="hover:text-brand-accent transition-colors">Stack</a>
            <a href="#experience" className="hover:text-brand-accent transition-colors">Experience</a>
            <a href="mailto:joel.tecson@gmail.com" className="hover:text-brand-accent transition-colors">Contact</a>
          </div>
          <button 
            onClick={() => document.getElementById('chat-trigger')?.click()}
            className="px-4 py-2 bg-brand-accent/10 border border-brand-accent/20 text-brand-accent rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-accent hover:text-white transition-all"
          >
            Hire Joel
          </button>
        </div>
      </nav>

      <Hero />
      <TechStack />
      <SkillsExperience />
      
      <footer className="py-12 border-t border-white/5 text-center">
        <p className="text-brand-text/20 text-sm font-mono">
          © {new Date().getFullYear()} Joel Tecson.
        </p>
      </footer>

      <ChatWidget />
    </main>
  );
}
