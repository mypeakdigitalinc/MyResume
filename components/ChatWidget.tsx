'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Mic, X, Send, Bot, User, Loader2, Volume2, VolumeX } from 'lucide-react';
import { GoogleGenAI, Modality } from "@google/genai";
import { resumeData } from '@/lib/resumeData';

const SYSTEM_INSTRUCTION = `
You are the AI Agent for Joel Tecson's professional portfolio.
Identity: Joel Tecson (Senior Software Developer / Architect / Lead)
Tone: Professional, direct, and technically knowledgeable. Use a male vocal profile.
Knowledge Base: ${JSON.stringify(resumeData)}

Primary Goals:
1. Summarize Joel’s specialties in AI/RAG, Payments, and Healthcare.
2. Facilitate appointment booking for projects or employment.

Booking Protocol:
When a user asks about hiring, collaborating, or booking a meeting, respond EXACTLY with: 
"I can certainly help with that. Would you like to view Joel's available time slots to discuss a potential project or employment opportunity?"

Guidelines:
- Be concise.
- Highlight Joel's 15+ years of experience.
- Mention compliance expertise (PCI, HIPAA, etc.) when relevant.
- If asked about something not in the resume, politely state you don't have that information but can discuss Joel's verified expertise.
`;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello, I&apos;m Joel&apos;s AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.concat({ role: 'user', content: userMessage }).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice Mode Logic
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const startVoiceSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });
      
      const session = await ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } }, // Professional male-sounding voice
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            console.log("Voice session opened");
            setIsRecording(true);
            startMic();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              const base64Audio = message.serverContent.modelTurn.parts[0].inlineData.data;
              playAudio(base64Audio);
            }
          },
          onclose: () => {
            setIsRecording(false);
            stopMic();
          }
        }
      });
      sessionRef.current = session;
    } catch (error) {
      console.error("Voice session error:", error);
      setMode('text');
    }
  };

  const startMic = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioContextRef.current = new AudioContext({ sampleRate: 16000 });
    const source = audioContextRef.current.createMediaStreamSource(stream);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current?.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const stopMic = () => {
    processorRef.current?.disconnect();
    audioContextRef.current?.close();
  };

  const playAudio = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const pcm = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(pcm.length);
    for (let i = 0; i < pcm.length; i++) float32[i] = pcm[i] / 0x7FFF;

    const ctx = new AudioContext({ sampleRate: 24000 });
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const toggleVoiceMode = async () => {
    if (mode === 'text') {
      setMode('voice');
      await startVoiceSession();
    } else {
      setMode('text');
      sessionRef.current?.close();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-brand-surface w-[350px] md:w-[400px] h-[550px] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-bottom border-white/5 bg-brand-dark/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-accent flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Joel&apos;s AI Agent</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-brand-text/40 uppercase tracking-widest font-bold">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleVoiceMode}
                  className={`p-2 rounded-lg transition-colors ${mode === 'voice' ? 'bg-brand-accent text-white' : 'hover:bg-white/5 text-brand-text/40'}`}
                >
                  <Mic size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-brand-text/40">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {mode === 'text' ? (
                <>
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        m.role === 'user' 
                          ? 'bg-brand-accent text-white rounded-tr-none' 
                          : 'bg-brand-dark/50 text-brand-text/80 border border-white/5 rounded-tl-none'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-brand-dark/50 p-3 rounded-2xl rounded-tl-none border border-white/5">
                        <Loader2 size={16} className="animate-spin text-brand-accent" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-brand-accent/20 blur-3xl rounded-full animate-pulse" />
                    <div className="relative w-32 h-32 rounded-full bg-brand-accent flex items-center justify-center electric-glow">
                      <Mic size={48} className="text-white" />
                    </div>
                    {/* Visualizer bars */}
                    <div className="flex gap-1 justify-center mt-8">
                      {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [10, 30, 10] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-brand-accent rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold">Live Voice Mode</h4>
                    <p className="text-sm text-brand-text/40 mt-2 px-8">
                      Speak naturally to Joel&apos;s AI agent. It uses a professional male voice.
                    </p>
                  </div>
                  <button 
                    onClick={() => setMode('text')}
                    className="px-6 py-2 bg-brand-surface border border-white/10 rounded-full text-sm hover:border-brand-accent/50 transition-all"
                  >
                    Switch to Text
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            {mode === 'text' && (
              <div className="p-4 border-t border-white/5 bg-brand-dark/30">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about Joel's experience..."
                    className="flex-1 bg-brand-dark/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="p-2 bg-brand-accent text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        id="chat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-brand-accent rounded-full flex items-center justify-center text-white shadow-2xl electric-glow hover:scale-110 transition-transform active:scale-95"
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>
    </div>
  );
}
