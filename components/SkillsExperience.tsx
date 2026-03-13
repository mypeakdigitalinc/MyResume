'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code2, 
  Cloud, 
  CreditCard, 
  HeartPulse, 
  ShieldCheck, 
  GraduationCap, 
  Award,
  ChevronRight
} from 'lucide-react';
import { resumeData } from '@/lib/resumeData';

const filterOptions = [
  { id: 'All', icon: null },
  { id: 'AI', icon: Code2 },
  { id: 'Cloud', icon: Cloud },
  { id: 'Payment Systems', icon: CreditCard },
  { id: 'Healthcare', icon: HeartPulse },
  { id: 'Cybersecurity', icon: ShieldCheck },
];

export default function SkillsExperience() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredExperience = useMemo(() => {
    if (activeFilter === 'All') {
      return resumeData.experience;
    }
    return resumeData.experience.filter(exp => exp.tags.includes(activeFilter));
  }, [activeFilter]);

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto" id="experience">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-4 tracking-tight">Skills & Experience</h2>
          <p className="text-brand-text/60 max-w-xl">
            Over 15 years of technical leadership across fintech, healthcare, and enterprise systems.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                activeFilter === filter.id 
                  ? 'bg-brand-accent border-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                  : 'bg-brand-surface border-white/5 text-brand-text/60 hover:border-brand-accent/50'
              }`}
            >
              {filter.icon && <filter.icon size={14} />}
              {filter.id}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Experience List */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredExperience.map((exp, idx) => (
              <motion.div
                key={exp.company + exp.role}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-brand-surface p-8 rounded-2xl border border-white/5 hover:border-brand-accent/30 transition-colors group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-accent group-hover:text-blue-400 transition-colors">
                      {exp.role}
                    </h3>
                    <p className="text-lg font-medium">{exp.company}</p>
                  </div>
                  <span className="text-sm text-brand-text/40 font-mono">{exp.period}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {exp.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3 text-brand-text/80 text-sm leading-relaxed">
                      <ChevronRight size={16} className="text-brand-accent mt-0.5 shrink-0" />
                      {highlight}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-brand-dark/50 rounded text-[10px] uppercase tracking-wider font-bold text-brand-text/40 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sidebar: Compliance & Education */}
        <div className="space-y-8">
          {/* Compliance */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <ShieldCheck className="text-brand-accent" />
              <h3 className="text-lg font-bold">Compliance Standards</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {resumeData.compliance.map(std => (
                <div key={std} className="p-3 bg-brand-dark/40 rounded-xl border border-white/5 text-xs font-mono text-center hover:border-brand-accent/50 transition-colors">
                  {std}
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="text-brand-accent" />
              <h3 className="text-lg font-bold">Education</h3>
            </div>
            {resumeData.education.map(edu => (
              <div key={edu.degree} className="space-y-1">
                <p className="font-bold text-sm">{edu.degree}</p>
                <p className="text-xs text-brand-text/60">{edu.institution}</p>
                <p className="text-[10px] text-brand-text/40 font-mono">{edu.period}</p>
              </div>
            ))}
          </div>

          {/* Trainings */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-6">
              <Award className="text-brand-accent" />
              <h3 className="text-lg font-bold">Trainings</h3>
            </div>
            <ul className="space-y-4">
              {resumeData.trainings.map(training => (
                <li key={training} className="text-xs text-brand-text/70 flex gap-2">
                  <div className="w-1 h-1 rounded-full bg-brand-accent mt-1.5 shrink-0" />
                  {training}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
