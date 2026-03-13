import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { resumeData as JoelResumeData } from "../lib/resumeData";

const SYSTEM_INSTRUCTION = `
Identity: You are the AI Assistant for Joel Tecson, a Toronto-based Software Engineer.
Perspective: You MUST always speak in the third person. Refer to Joel as "Joel" or "he/him". NEVER refer to yourself as Joel or use "I" to describe Joel's experiences.
Tone: Professional, direct, and technically knowledgeable. Use a male vocal profile.
Experience Context:
- Joel has 15+ years of experience.
- He currently leads AI and QA teams at Mediresource, focusing on Vertex AI and RAG.
- He has a deep background in Payment Systems from his time at PAX Technology and Verifone.
- Knowledge Base: ${JSON.stringify(JoelResumeData)}

Booking Protocol: When a user asks about hiring or collaborating, respond: "I can certainly help with that. Would you like to view Joel's available time slots to discuss a potential project or employment opportunity?"
`;

export class LiveVoiceService {
  private ai: GoogleGenAI;
  private session: any;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private audioQueue: Int16Array[] = [];
  private isPlaying = false;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(onMessage: (text: string) => void, onInterrupted: () => void) {
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    
    this.session = await this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
        },
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onopen: () => {
          this.startMic();
        },
        onmessage: async (message: LiveServerMessage) => {
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts && parts[0]?.inlineData?.data) {
            this.playAudio(parts[0].inlineData.data);
          }
          if (message.serverContent?.interrupted) {
            this.stopPlayback();
            onInterrupted();
          }
          if (parts && parts[0]?.text) {
            onMessage(parts[0].text);
          }
        },
        onclose: () => {
          this.stopMic();
        },
        onerror: (error) => {
          console.error("Live API Error:", error);
        }
      }
    });
  }

  private async startMic() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.source = this.audioContext!.createMediaStreamSource(stream);
    this.processor = this.audioContext!.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = this.floatTo16BitPCM(inputData);
      const base64Data = this.arrayBufferToBase64(pcmData.buffer);
      
      this.session.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioContext!.destination);
  }

  private stopMic() {
    this.source?.disconnect();
    this.processor?.disconnect();
    this.source = null;
    this.processor = null;
  }

  private floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async playAudio(base64: string) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const pcmData = new Int16Array(bytes.buffer);
    this.audioQueue.push(pcmData);
    if (!this.isPlaying) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    const pcmData = this.audioQueue.shift()!;
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x8000;
    }

    const buffer = this.audioContext!.createBuffer(1, floatData.length, 24000); // Live API output is 24kHz
    buffer.getChannelData(0).set(floatData);
    
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);
    source.onended = () => this.processQueue();
    source.start();
  }

  private stopPlayback() {
    this.audioQueue = [];
    this.isPlaying = false;
  }

  disconnect() {
    this.stopMic();
    this.session?.close();
    this.audioContext?.close();
  }
}
