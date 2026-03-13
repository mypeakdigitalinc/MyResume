'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Mic, X, Send, ChevronDown, User, Bot, Volume2, VolumeX, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from '../services/gemini';
import { LiveVoiceService } from '../services/liveApi';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export const AIAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hello! I'm Joel's AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const liveServiceRef = useRef<LiveVoiceService | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      liveServiceRef.current?.disconnect();
    };
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const response = await getChatResponse(userMsg, history);
      setMessages(prev => [...prev, { role: 'bot', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "Error connecting to AI service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startVoiceMode = async () => {
    setMode('voice');
    setIsLiveActive(true);
    
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      liveServiceRef.current = new LiveVoiceService(apiKey);
      await liveServiceRef.current.connect(
        (text) => {
          if (text) setMessages(prev => [...prev, { role: 'bot', text }]);
        },
        () => {
          console.log("Interrupted");
        }
      );
    } catch (error) {
      console.error("Failed to start voice mode:", error);
      setIsLiveActive(false);
      setMode('text');
    }
  };

  const stopVoiceMode = () => {
    liveServiceRef.current?.disconnect();
    liveServiceRef.current = null;
    setIsLiveActive(false);
    setMode('text');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            id="chat-trigger"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-lg electric-glow hover:scale-110 transition-transform"
          >
            <Bot size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className="w-96 h-[500px] bg-brand-dark border border-white/10 flex flex-col overflow-hidden shadow-2xl rounded-3xl"
          >
            {/* Header */}
            <div className="p-4 bg-brand-surface border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Joel&apos;s AI Assistant</h3>
                  <p className="text-xs text-brand-muted">
                    {isLiveActive ? 'Live Voice Active' : 'Online • Professional Mode'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={isLiveActive ? stopVoiceMode : startVoiceMode}
                  className={`p-2 rounded-lg transition-colors ${isLiveActive ? 'bg-red-500 text-white' : 'hover:bg-white/10 text-brand-muted'}`}
                >
                  {isLiveActive ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg text-brand-muted">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-brand-dark/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-brand-accent text-white rounded-tr-none' 
                      : 'bg-brand-surface border border-white/5 rounded-tl-none text-brand-text'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-brand-surface border border-white/5 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-brand-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Voice Mode Overlay */}
            {mode === 'voice' && (
              <div className="absolute inset-0 top-16 bg-brand-dark flex flex-col items-center justify-center p-8 text-center space-y-6 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-brand-accent/20 rounded-full animate-ping" />
                  <div className="w-24 h-24 bg-brand-accent rounded-full flex items-center justify-center text-white relative z-10">
                    <Mic size={48} />
                  </div>
                </div>
                <div>
                  <h4 className="text-xl font-bold">Live Voice Mode</h4>
                  <p className="text-brand-muted text-sm mt-2">
                    Speak naturally. I&apos;m listening to help you learn more about Joel&apos;s expertise.
                  </p>
                </div>
                <button 
                  onClick={stopVoiceMode}
                  className="px-6 py-2 border border-white/10 rounded-full text-sm hover:bg-white/5 transition-colors"
                >
                  End Voice Session
                </button>
              </div>
            )}

            {/* Input */}
            {mode === 'text' && (
              <div className="p-4 border-t border-white/10 bg-brand-surface">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about Joel's experience..."
                    className="w-full bg-brand-dark border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-accent transition-colors text-brand-text"
                  />
                  <button 
                    onClick={handleSend}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
