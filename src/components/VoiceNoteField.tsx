import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Check, X, AlertTriangle, RefreshCw, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceNoteFieldProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export default function VoiceNoteField({
  value,
  onChange,
  label = 'ملاحظات الصيانة والتقرير الفني الصوتي:',
  placeholder = 'اضغط على الميكروفون للتحدث وتسجيل التقرير الصوتي المباشر...',
  rows = 3,
  disabled = false
}: VoiceNoteFieldProps) {
  const [isListening, setIsListening] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [showSupportWarn, setShowSupportWarn] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check support on mount
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setShowSupportWarn(true);
    }
  }, []);

  const toggleListening = () => {
    if (disabled) return;
    setErrorStatus(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorStatus('نظام التشغيل أو المتصفح الحالي لا يدعم التعرف المباشر على الصوت.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'ar-SA'; // Native Arabic Support (Saudi Arabia/Arab Gulf & Standard Arabic)

        recognition.onstart = () => {
          setIsListening(true);
          setErrorStatus(null);
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            // Append with space if there is existing content
            onChange(value ? `${value.trim()} ${finalTranscript.trim()}` : finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event);
          if (event.error === 'not-allowed') {
            setErrorStatus('تم رفض الوصول للميكروفون. يرجى تفعيل الصلاحية من قفل الأمان بالمتصفح.');
          } else {
            setErrorStatus(`خطأ في التعرف: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setErrorStatus(`عرقل عملية التشغيل: ${err.message || err}`);
        setIsListening(false);
      }
    }
  };

  const handleClear = () => {
    if (window.confirm('هل تريد مسح النص المكتوب بالكامل؟')) {
      onChange('');
    }
  };

  return (
    <div className="space-y-1.5" id="voice-note-field-container">
      {label && (
        <label className="text-[10px] font-black text-slate-700 dark:text-slate-350 flex items-center justify-between gap-1">
          <span>{label}</span>
          {isListening && (
            <span className="flex items-center gap-1 text-[9px] text-rose-500 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block"></span>
              جاري الاستماع للتحويل الفوري...
            </span>
          )}
        </label>
      )}

      <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-brand-blue-400 dark:focus-within:border-brand-blue-500 transition-all shadow-sm overflow-hidden p-1.5">
        
        {/* Main Text Area */}
        <textarea
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={isListening ? 'تحدث الآن بملاحظاتك، جاري كتابة ما تقوله باللغة العربية بدقة...' : placeholder}
          className="w-full bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold leading-relaxed outline-none border-none p-2.5 resize-none placeholder-slate-400 dark:placeholder-slate-600 block pl-14"
        />

        {/* Pulse Sound Wave Visualizer when Active */}
        <AnimatePresence>
          {isListening && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute left-16 bottom-3.5 flex items-center gap-1.2 bg-rose-50 dark:bg-rose-950/20 py-1 px-2.5 rounded-full border border-rose-100 dark:border-rose-900/50"
            >
              <div className="flex gap-[2px] items-center h-2.5">
                <span className="w-[2px] h-2.5 bg-rose-500 dark:bg-rose-400 rounded-full animate-[pulse_0.4s_infinite_alternate]"></span>
                <span className="w-[2px] h-1.5 bg-rose-500 dark:bg-rose-450 rounded-full animate-[pulse_0.6s_infinite_alternate_0.1s]"></span>
                <span className="w-[2px] h-3 bg-rose-500 dark:bg-rose-400 rounded-full animate-[pulse_0.5s_infinite_alternate_0.2s]"></span>
                <span className="w-[2px] h-1 bg-rose-500 dark:bg-rose-450 rounded-full animate-[pulse_0.7s_infinite_alternate_0.3s]"></span>
                <span className="w-[2px] h-2 bg-rose-500 dark:bg-rose-400 rounded-full animate-[pulse_0.4s_infinite_alternate_0.1s]"></span>
              </div>
              <span className="text-[8px] font-black text-rose-600 dark:text-rose-400 font-mono tracking-wider">AUDIO ACTIVE</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Control Action Overlays on Right Bottom / Left Side */}
        <div className="absolute left-3 bottom-2 flex items-center gap-1.5 z-10">
          
          {/* Microphone trigger button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={disabled}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm relative group ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400'
            }`}
            title={isListening ? 'إيقاف التسجيل الصوتي' : 'تسجيل ملاحظات صوتياً'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            
            {/* Soft indicator dot */}
            {!isListening && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-slate-900"></span>
            )}
          </button>

          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 px-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
              title="مسح النص"
            >
              مسح
            </button>
          )}

        </div>
      </div>

      {/* Warnings & Help elements */}
      <AnimatePresence>
        {errorStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-900/50 text-[10px] font-bold flex items-center gap-1.5"
          >
            <AlertTriangle size={12} className="shrink-0" />
            <span>{errorStatus}</span>
          </motion.div>
        )}

        {showSupportWarn && !errorStatus && (
          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-tight px-1 flex items-center gap-1 opacity-80">
            <Volume2 size={10} className="text-slate-400" />
            <span>متصفحك يدعم الميكروفون والتعرف على الصوت باللغة العربية بطلاقة.</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
