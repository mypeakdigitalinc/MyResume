'use client';

import { motion } from 'motion/react';
import { resumeData } from '@/lib/resumeData';
import { Terminal, Cpu, Layers, Globe, Download, Mail, Linkedin, MapPin, Phone } from 'lucide-react';

export default function Hero() {
  const { email, linkedin, location, phone } = resumeData.personalInfo;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 midnight-gradient -z-10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-accent/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/20 text-brand-accent text-xs font-bold tracking-widest uppercase mb-6">
            <Terminal size={14} />
            Lead Senior Software Engineer
          </div>
          
          <h1 className="text-6xl lg:text-8xl font-bold mb-6 leading-tight tracking-tighter">
            Joel <span className="text-brand-accent">Tecson</span>
          </h1>
          
          <p className="text-xl text-brand-text/70 mb-8 max-w-lg leading-relaxed">
            {resumeData.personalInfo.summary}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <a 
              href="/Joel_Tecson_Resume.pdf" 
              download="Joel_Tecson_Resume.pdf"
              className="px-8 py-4 bg-brand-accent text-white rounded-xl font-bold hover:bg-blue-600 transition-all electric-glow flex items-center gap-2"
            >
              <Download size={20} />
              Download Resume
            </a>
            <button 
              onClick={() => document.getElementById('chat-trigger')?.click()}
              className="px-8 py-4 bg-brand-surface border border-white/10 text-white rounded-xl font-bold hover:border-brand-accent/50 transition-all"
            >
              Talk to AI Agent
            </button>
            <div className="flex items-center gap-3 px-4 py-3 bg-brand-surface/30 border border-white/5 rounded-xl backdrop-blur-sm">
              <div className="w-8 h-8 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent">
                <Phone size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text/40">Mobile AI Assistant</span>
                <a href="tel:+16475603039" className="text-sm font-bold text-white hover:text-brand-accent transition-colors">
                  +1 (647) 560-3039
                </a>
              </div>
            </div>
          </div>

          {/* Integrated Contact Section */}
          <div className="flex flex-wrap gap-6 pt-6 border-t border-white/5">
            <ContactItem icon={Mail} value={email} href={`mailto:${email}`} />
            <ContactItem icon={Linkedin} value="LinkedIn" href={linkedin} />
            <ContactItem icon={Phone} value={phone} href={`tel:${phone}`} />
            <ContactItem icon={MapPin} value={location} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative hidden lg:block"
        >
          <div className="bg-brand-surface/50 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 text-white">Professional Profile</h3>
            <p className="text-brand-text/60 leading-relaxed mb-6">
              Strategic engineering leader with over 15 years of experience in architecting high-performance enterprise systems. 
              Expert in <span className="text-brand-accent">Fintech</span>, <span className="text-brand-accent">HealthTech</span>, and <span className="text-brand-accent">AI integration</span>, 
              delivering secure, scalable solutions for global platforms. Proven track record in leading cross-functional teams 
              and implementing robust DevSecOps practices.
            </p>
            
            <div className="flex gap-4">
              <div className="flex-1 p-4 bg-brand-dark/50 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 mb-1">Experience</p>
                <p className="text-xl font-bold text-brand-accent">15+ Years</p>
              </div>
              <div className="flex-1 p-4 bg-brand-dark/50 rounded-2xl border border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-brand-text/40 mb-1">Compliance</p>
                <p className="text-xl font-bold text-brand-accent">PCI/HIPAA</p>
              </div>
            </div>
          </div>
          
          {/* Decorative Code Block */}
          <div className="mt-8 p-6 bg-brand-dark/80 rounded-2xl border border-white/5 font-mono text-xs text-brand-text/40 shadow-2xl">
            <div className="flex gap-1.5 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
            </div>
            <p className="text-brand-accent">class</p> <p className="inline">JoelTecson extends SeniorEngineer {"{"}</p>
            <p className="pl-4 mt-1">specialties = [</p>
            <p className="pl-8 text-emerald-400">&quot;Fintech&quot;, &quot;HealthTech&quot;, &quot;AI/RAG&quot;</p>
            <p className="pl-4">];</p>
            <p className="pl-4 mt-1">status = <span className="text-orange-400">&quot;Architecting the Future&quot;</span>;</p>
            <p>{"}"}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactItem({ icon: Icon, value, href }: { icon: any, value: string, href?: string }) {
  const content = (
    <div className="flex items-center gap-2 group">
      <Icon size={16} className="text-brand-accent group-hover:scale-110 transition-transform" />
      <span className="text-xs font-medium text-brand-text/60 group-hover:text-brand-accent transition-colors">{value}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    );
  }

  return content;
}
