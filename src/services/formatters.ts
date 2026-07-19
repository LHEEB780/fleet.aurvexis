import { safeLocalStorage } from './safeStorage';

/**
 * Gets the selected base currency from local storage. Defaults to 'SAR'.
 */
export function getBaseCurrency(): string {
  if (typeof window === 'undefined') return 'SAR';
  return safeLocalStorage.getItem('saas_base_currency') || 'SAR';
}

/**
 * Gets the localized currency label/symbol based on selected currency and language.
 */
export function getCurrencyLabel(language: 'ar' | 'en' = 'ar'): string {
  const baseCurrency = getBaseCurrency();
  const currencyLabelsAr: Record<string, string> = {
    'SAR': 'ر.س',
    'USD': '$',
    'AED': 'د.إ',
    'EGP': 'ج.م',
    'QAR': 'ر.ق',
    'KWD': 'د.ك',
    'OMR': 'ر.ع',
    'BHD': 'د.ب',
    'EUR': '€'
  };

  const currencyLabelsEn: Record<string, string> = {
    'SAR': 'SAR',
    'USD': 'USD',
    'AED': 'AED',
    'EGP': 'EGP',
    'QAR': 'QAR',
    'KWD': 'KWD',
    'OMR': 'OMR',
    'BHD': 'BHD',
    'EUR': 'EUR'
  };

  return language === 'ar' 
    ? (currencyLabelsAr[baseCurrency] || baseCurrency) 
    : (currencyLabelsEn[baseCurrency] || baseCurrency);
}

/**
 * Returns conversion rate from SAR to selected currency.
 * The application's local maintenance/inventory costs are authored in SAR (ر.س).
 */
export function getConversionRateFromSAR(): number {
  const baseCurrency = getBaseCurrency();
  // 1 SAR equivalents
  const rates: Record<string, number> = {
    'SAR': 1.0,
    'USD': 0.27,      // 1 SAR = 0.266 USD
    'AED': 0.98,      // 1 SAR = 0.979 AED
    'EGP': 12.80,     // 1 SAR = ~12.80 EGP
    'QAR': 0.97,      // 1 SAR = 0.97 QAR
    'KWD': 0.082,     // 1 SAR = 0.082 KWD
    'OMR': 0.10,      // 1 SAR = 0.10 OMR
    'BHD': 0.10,      // 1 SAR = 0.10 BHD
    'EUR': 0.25       // 1 SAR = 0.25 EUR
  };
  return rates[baseCurrency] || 1.0;
}

/**
 * Returns conversion rate from USD to selected currency.
 * The SaaS billing/pricing plans are authored in USD.
 */
export function getConversionRateFromUSD(): number {
  const baseCurrency = getBaseCurrency();
  // 1 USD equivalents
  const rates: Record<string, number> = {
    'SAR': 3.75,
    'USD': 1.0,
    'AED': 3.67,
    'EGP': 48.0,
    'QAR': 3.64,
    'KWD': 0.31,
    'OMR': 0.38,
    'BHD': 0.38,
    'EUR': 0.92
  };
  return rates[baseCurrency] || 1.0;
}

/**
 * Formats a numeric value (assumed in local currency or converted) into a localized currency string.
 * If convertFromSource is provided ('SAR' or 'USD'), it first converts the value.
 */
export function formatCurrency(
  amount: number | string | undefined | null, 
  language: 'ar' | 'en' = 'ar',
  convertFromSource?: 'SAR' | 'USD'
): string {
  let num = Number(amount) || 0;
  
  if (convertFromSource === 'SAR') {
    num = num * getConversionRateFromSAR();
  } else if (convertFromSource === 'USD') {
    num = num * getConversionRateFromUSD();
  }

  const formatted = num.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  const label = getCurrencyLabel(language);
  
  // Return format with currency label
  if (language === 'ar') {
    return `${formatted} ${label}`;
  } else {
    return `${formatted} ${label}`;
  }
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
