import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Trash2, UploadCloud, VideoOff, Image, AlertCircle, Check } from 'lucide-react';

interface CameraCaptureProps {
  photoUrl: string;
  onPhotoCaptured: (base64Photo: string) => void;
  onPhotoCleared: () => void;
  title?: string;
  description?: string;
  language?: string;
}

export default function CameraCapture({ 
  photoUrl, 
  onPhotoCaptured, 
  onPhotoCleared,
  title,
  description,
  language = 'ar'
}: CameraCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera tracks when component unmounts or camera becomes inactive
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Default to back camera for mobile device scanning defects
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
        });
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      setError('تعذر تشغيل الكاميرا المباشرة. يرجى التأكد من منح الإذن للموقع أو استخدام ميزة رفع ملف.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the video frame to the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert to base64
        const base64Data = canvas.toDataURL('image/jpeg', 0.82);
        onPhotoCaptured(base64Data);
        stopCamera();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onPhotoCaptured(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-2xl border border-slate-205 dark:border-slate-800 space-y-2 h-full flex flex-col justify-between">
      <div className="space-y-1">
        <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Camera size={12} className="text-brand-blue-500" />
          <span>
            {title || (language === 'ar' ? 'توثيق وتصوير الأعطال ميكانيكياً:' : 'Mechanical Defect Visual Documentation:')}
          </span>
        </label>
        <p className="text-[9px] text-slate-400">
          {description || (language === 'ar' ? 'التقط صورة العطل مباشرة أو ارفعها لتسهيل تشخيص المهندسين بالورشة.' : 'Capture the defect directly or upload a photo to assist workshop diagnostics.')}
        </p>
      </div>

      {/* Main Area */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group">
        {photoUrl ? (
          // Photo Preview Mode
          <div className="relative w-full h-full">
            <img src={photoUrl} alt="Defect" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={triggerFileSelect}
                className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-md transition-all scale-95 hover:scale-100 cursor-pointer"
                title={language === 'ar' ? 'تحديث الصورة' : 'Update Photo'}
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={() => {
                  onPhotoCleared();
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-all scale-95 hover:scale-100 cursor-pointer"
                title={language === 'ar' ? 'حذف الصورة' : 'Delete Photo'}
              >
                <Trash2 size={15} />
              </button>
            </div>
            
            <div className="absolute bottom-2 right-2 bg-emerald-600/90 text-[9px] text-white px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
              <Check size={8} strokeWidth={4} />
              <span>{language === 'ar' ? 'جاهز للربط بالطلب' : 'Ready to attach'}</span>
            </div>
          </div>
        ) : isCameraActive ? (
          // Active Camera Mode
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]" // mirror effect
            />
            {/* Visual alignment aids */}
            <div className="absolute inset-4 border border-dashed border-white/40 pointer-events-none rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border-t-2 border-r-2 border-white/70 absolute top-0 right-0"></div>
              <div className="w-6 h-6 border-t-2 border-l-2 border-white/70 absolute top-0 left-0"></div>
              <div className="w-6 h-6 border-b-2 border-r-2 border-white/70 absolute bottom-0 right-0"></div>
              <div className="w-6 h-6 border-b-2 border-l-2 border-white/70 absolute bottom-0 left-0"></div>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center gap-2 bg-black/55 p-1.5 rounded-lg">
              <button
                type="button"
                onClick={capturePhoto}
                className="flex-1 py-1 px-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white rounded-md text-[10px] font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
              >
                <Camera size={11} />
                <span>{language === 'ar' ? 'التقاط الصورة' : 'Capture Photo'}</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md text-[10px] font-bold cursor-pointer"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          // Default Idle Upload or Start Camera Mode
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Camera size={26} className="text-slate-500 animate-pulse" />
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 block">
                {language === 'ar' ? 'لم يتم التقاط صورة' : 'No photo captured'}
              </span>
              <span className="text-[8px] text-slate-500 block">
                {language === 'ar' ? 'اضغط زر تشغيل الكاميرا أو قم بالرفع اليدوي لتوثيق فوري.' : 'Click to start camera or upload a photo manually.'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={startCamera}
                className="px-2.5 py-1 bg-brand-blue-50 hover:bg-brand-blue-100 text-brand-blue-600 dark:bg-brand-blue-950/40 dark:text-brand-blue-400 dark:hover:bg-brand-blue-900/40 text-[9px] font-black rounded-lg border border-brand-blue-250/20 cursor-pointer flex items-center gap-1"
              >
                <Camera size={10} />
                <span>{language === 'ar' ? 'تشغيل الكاميرا' : 'Start Camera'}</span>
              </button>
              <button
                type="button"
                onClick={triggerFileSelect}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[9px] font-bold rounded-lg cursor-pointer flex items-center gap-1"
              >
                <UploadCloud size={10} />
                <span>{language === 'ar' ? 'رفع صورة' : 'Upload Image'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input for file uploading fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="bg-rose-50 dark:bg-rose-950/25 border border-rose-200 text-rose-600 dark:text-rose-400 p-2 rounded-lg text-[9px] leading-tight flex items-start gap-1">
          <AlertCircle size={10} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
