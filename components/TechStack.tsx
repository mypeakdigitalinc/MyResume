'use client';

import { motion } from 'motion/react';
import { 
  Code, 
  Globe, 
  Server, 
  Smartphone, 
  Database, 
  Settings, 
  Zap, 
  Cloud 
} from 'lucide-react';
import { resumeData } from '@/lib/resumeData';

const stackCategories = [
  { id: 'languages', title: 'Languages', icon: Code, color: 'text-amber-400' },
  { id: 'web', title: 'Web & Frontend', icon: Globe, color: 'text-blue-400' },
  { id: 'backend', title: 'Backend Frameworks', icon: Server, color: 'text-emerald-400' },
  { id: 'mobile', title: 'Mobile Development', icon: Smartphone, color: 'text-purple-400' },
  { id: 'database', title: 'Database Systems', icon: Database, color: 'text-red-400' },
  { id: 'devops', title: 'DevOps & Testing', icon: Settings, color: 'text-orange-400' },
  { id: 'ai', title: 'AI & Machine Learning', icon: Zap, color: 'text-yellow-400' },
  { id: 'cloud', title: 'Cloud Platforms', icon: Cloud, color: 'text-cyan-400' },
];

export default function TechStack() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto" id="tech-stack">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold mb-4 tracking-tight">Technology Stack</h2>
        <p className="text-brand-text/60 max-w-2xl mx-auto">
          A comprehensive toolkit built over 15 years of enterprise-level software engineering and architectural design.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stackCategories.map((category, idx) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="bg-brand-surface p-6 rounded-2xl border border-white/5 hover:border-brand-accent/30 transition-all group"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg bg-brand-dark/50 ${category.color}`}>
                <category.icon size={20} />
              </div>
              <h3 className="font-bold text-sm tracking-wide uppercase">{category.title}</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {(resumeData.skills as any)[category.id].map((skill: string) => (
                <span 
                  key={skill} 
                  className="px-3 py-1.5 bg-brand-dark/40 rounded-lg text-xs font-medium text-brand-text/70 border border-white/5 hover:text-brand-accent hover:border-brand-accent/30 transition-colors cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
