import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, PenTool } from 'lucide-react';

interface SignaturePadProps {
  savedSignature?: string;
  onSave: (signatureDataUrl: string) => void;
  onClear?: () => void;
  language: 'ar' | 'en';
}

export const SignaturePad: React.FC<SignaturePadProps> = ({
  savedSignature,
  onSave,
  onClear,
  language,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!savedSignature);

  // Initialize canvas with proper scale for high DPI displays
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set brush options
    ctx.strokeStyle = '#3b82f6'; // Indigo/blue signature color
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If there is an existing signature, draw it on the canvas
    if (savedSignature) {
      const img = new Image();
      img.src = savedSignature;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasSigned(true);
      };
    }
  }, [savedSignature]);

  // Helper to get touch/mouse coordinates relative to canvas
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    
    // Support both Touch and Mouse
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      // Auto-propagate the visual signature changes to the parent on stroke end
      saveSignature();
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    if (onClear) onClear();
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;

    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  return (
    <div className="space-y-2 text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-bold">
          <PenTool size={13} className="text-indigo-500" />
          <span>
            {language === 'ar' ? 'التوقيع الرقمي للفني:' : "Technician's Digital Signature:"}
          </span>
        </div>
        
        {hasSigned && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-rose-500 hover:text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 px-2 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer font-bold"
          >
            <Eraser size={11} />
            <span>{language === 'ar' ? 'مسح التوقيع' : 'Clear Signature'}</span>
          </button>
        )}
      </div>

      <div className="relative bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800/80 overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={360}
          height={140}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-[140px] block cursor-crosshair touch-none"
        />

        {!hasSigned && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-400 dark:text-slate-500 gap-1.5">
            <span className="text-[10px] font-medium font-sans">
              {language === 'ar' ? 'وقّع بيدك أو بالقلم هنا للتوثيق' : 'Draw your signature here with finger/stylus'}
            </span>
          </div>
        )}

        {hasSigned && (
          <div className="absolute bottom-2 left-2 bg-emerald-500/90 text-white text-[8px] font-black tracking-wide px-1.5 py-0.5 rounded-md flex items-center gap-0.5 pointer-events-none shadow-xs">
            <Check size={8} strokeWidth={3} />
            <span>{language === 'ar' ? 'تم التوقيع' : 'SIGNED'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
