// Centralized Formatters and Helpers for localized currencies, dates, and state indicators.

/**
 * Formats a numeric value into a localized currency string (SAR / ر.س).
 */
export function formatCurrency(amount: number | string | undefined | null, language: 'ar' | 'en' = 'ar'): string {
  const num = Number(amount) || 0;
  const formatted = num.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  return language === 'ar' ? `${formatted} ر.س` : `${formatted} SAR`;
}

/**
 * Formats an ISO date or timestamp into a beautiful, human-readable date.
 */
export function formatDate(dateStr: string | undefined | null, language: 'ar' | 'en' = 'ar'): string {
  if (!dateStr) return language === 'ar' ? 'غير حدد' : 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Returns Tailwind class names and translation label for standard operational/maintenance statuses.
 */
export interface StatusMeta {
  bg: string;
  text: string;
  border: string;
  label: string;
}

export function getStatusMeta(status: string | undefined, language: 'ar' | 'en' = 'ar'): StatusMeta {
  const norm = (status || '').toLowerCase().trim();
  
  const arLabels: Record<string, string> = {
    'pending': '⏳ قيد الانتظار',
    'approved': '✓ تم الاعتماد',
    'active': '🟢 نشط',
    'completed': '✅ مكتمل',
    'cancelled': '✕ ملغي',
    'operational': '🟢 يعمل بكفاءة',
    'maintenance': '🔧 تحت الصيانة',
    'at-capacity': '⚠️ مستنفذ السعة',
  };

  const enLabels: Record<string, string> = {
    'pending': '⏳ Pending',
    'approved': '✓ Approved',
    'active': '🟢 Active',
    'completed': '✅ Completed',
    'cancelled': '✕ Cancelled',
    'operational': '🟢 Operational',
    'maintenance': '🔧 Maintenance',
    'at-capacity': '⚠️ At Capacity',
  };

  const label = language === 'ar' 
    ? (arLabels[norm] || status || 'غير معروف') 
    : (enLabels[norm] || status || 'Unknown');

  switch (norm) {
    case 'completed':
    case 'approved':
    case 'operational':
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20 dark:border-emerald-500/10',
        label
      };
    case 'pending':
    case 'at-capacity':
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/5',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-500/10',
        label
      };
    case 'maintenance':
      return {
        bg: 'bg-rose-500/10 dark:bg-rose-500/5',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20 dark:border-rose-500/10',
        label
      };
    default:
      return {
        bg: 'bg-slate-500/10 dark:bg-slate-500/5',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-500/20 dark:border-slate-500/10',
        label
      };
  }
}
