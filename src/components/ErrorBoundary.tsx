import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle, RefreshCw, Database } from 'lucide-react';
import { freeStorageSpace, sanitizeEntireLocalStorage } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  declare props: Props;
  declare setState: (state: Partial<State> | ((prevState: State, props: Props) => Partial<State>), callback?: () => void) => void;

  state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    // If storage quota error, automatically attempt cleanup
    const errStr = String(error?.message || error || '').toLowerCase();
    if (errStr.includes('quota') || errStr.includes('setitem') || errStr.includes('storage')) {
      try {
        freeStorageSpace();
        sanitizeEntireLocalStorage();
      } catch (e) {}
    }
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCacheAndReload = () => {
    try {
      freeStorageSpace();
      sanitizeEntireLocalStorage();
      localStorage.removeItem('saas_active_tab');
      localStorage.removeItem('fleet_barcode_queue');
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  handleDeepCleanQuota = () => {
    try {
      freeStorageSpace();
      sanitizeEntireLocalStorage();
      localStorage.removeItem('fleet_barcode_queue');
      localStorage.removeItem('fleet_offline_maintenance_queue');
      localStorage.removeItem('saas_critical_audit_logs');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isQuotaError = String(this.state.error?.message || this.state.error || '').toLowerCase().includes('quota');

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans dir-rtl" dir="rtl">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-right">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto sm:mx-0">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">
                {isQuotaError ? 'تم تجاوز الحد المتاح للذاكرة المؤقتة' : 'حدث تعذر بسيط أثناء تحميل الصفحة'}
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isQuotaError 
                  ? 'تم اكتشاف امتلاء المساحة المخصصة للتخزين في المتصفح. يمكنك بنقرة واحدة تفريغ الملفات المؤقتة القديمة ومتابعة العمل فوراً دون فقدان أي بيانات.'
                  : 'التطبيق متصل ومحدث بالكامل، ولكن حدث خطأ مؤقت في استجابة العرض على متصفح جهازك. يمكنك إعادة تشغيل الواجهة فوراً بنقرة زر.'}
              </p>
            </div>

            <div className="pt-2 space-y-3">
              {isQuotaError ? (
                <button
                  type="button"
                  onClick={this.handleDeepCleanQuota}
                  className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Database size={16} />
                  <span>تفريغ الذاكرة المؤقتة وتشغيل التطبيق الآن</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full py-3.5 px-5 bg-violet-600 hover:bg-violet-500 active:scale-98 text-white font-black text-xs rounded-2xl shadow-lg shadow-violet-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw size={16} className="animate-spin-slow" />
                  <span>إعادة تحميل وتحديث التطبيق الآن</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleResetCacheAndReload}
                className="w-full py-3 px-5 bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-300 font-bold text-xs rounded-2xl border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>تصفير التخزين المؤقت والفتح المباشر</span>
              </button>
            </div>

            {this.state.error && (
              <details className="mt-4 pt-4 border-t border-slate-800 text-right">
                <summary className="text-[10px] text-slate-500 font-mono cursor-pointer hover:text-slate-400">
                  تفاصيل الخطأ الفني (للمطورين)
                </summary>
                <div className="mt-2 p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-rose-400 overflow-x-auto dir-ltr text-left">
                  <p className="font-bold">{this.state.error.toString()}</p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="mt-1 text-[9px] text-slate-500 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
