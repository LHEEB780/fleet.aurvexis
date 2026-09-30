import { safeLocalStorage } from './safeStorage';

/**
 * Gets the selected base currency from local storage. Defaults to 'SAR'.
 */
export function getBaseCurrency(): string {
  if (typeof window === 'undefined') return 'SAR';
  return safeLocalStorage.getItem('saas_base_currency') || 'SAR';
}

/**
 * Sets the active base currency in local storage and notifies listeners.
 */
export function setBaseCurrency(currency: string): void {
  if (typeof window !== 'undefined') {
    safeLocalStorage.setItem('saas_base_currency', currency);
    window.dispatchEvent(new CustomEvent('base-currency-changed', { detail: { currency } }));
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Gets the secondary pinned currency shown in the topbar alongside the primary currency.
 * Defaults to 'USD', or if base currency is another foreign currency (e.g. IQD/JOD), defaults to that.
 */
export function getPinnedSecondaryCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  const saved = safeLocalStorage.getItem('saas_pinned_secondary_currency');
  if (saved && saved !== 'SAR') return saved;
  const base = getBaseCurrency();
  if (base && base !== 'SAR') return base;
  return 'USD';
}

/**
 * Sets the secondary pinned currency in local storage and notifies listeners.
 */
export function setPinnedSecondaryCurrency(currency: string): void {
  if (typeof window !== 'undefined') {
    safeLocalStorage.setItem('saas_pinned_secondary_currency', currency);
    window.dispatchEvent(new CustomEvent('secondary-currency-changed', { detail: { currency } }));
    window.dispatchEvent(new Event('storage'));
  }
}

export interface CurrencyItem {
  id: string;
  labelAr: string;
  labelEn: string;
  symbolAr: string;
  symbolEn: string;
  flag: string;
  countryAr: string;
  countryEn: string;
  rateVsSar: string;
  rateVsUsd: string;
}

export const SUPPORTED_CURRENCIES: CurrencyItem[] = [
  { id: 'SAR', labelAr: 'ريال سعودي', labelEn: 'Saudi Riyal', symbolAr: 'ر.س', symbolEn: 'SAR', flag: '🇸🇦', countryAr: 'المملكة العربية السعودية', countryEn: 'Saudi Arabia', rateVsSar: '1.0 (المرجع الأساسي)', rateVsUsd: '3.75' },
  { id: 'USD', labelAr: 'دولار أمريكي', labelEn: 'US Dollar', symbolAr: '$', symbolEn: 'USD', flag: '🇺🇸', countryAr: 'الولايات المتحدة', countryEn: 'United States', rateVsSar: '0.27', rateVsUsd: '1.0' },
  { id: 'IQD', labelAr: 'دينار عراقي', labelEn: 'Iraqi Dinar', symbolAr: 'د.ع', symbolEn: 'IQD', flag: '🇮🇶', countryAr: 'العراق', countryEn: 'Iraq', rateVsSar: '349.33', rateVsUsd: '1,310' },
  { id: 'JOD', labelAr: 'دينار أردني', labelEn: 'Jordanian Dinar', symbolAr: 'د.أ', symbolEn: 'JOD', flag: '🇯🇴', countryAr: 'الأردن', countryEn: 'Jordan', rateVsSar: '0.189', rateVsUsd: '0.709' },
  { id: 'AED', labelAr: 'درهم إماراتي', labelEn: 'UAE Dirham', symbolAr: 'د.إ', symbolEn: 'AED', flag: '🇦🇪', countryAr: 'الإمارات العربية المتحدة', countryEn: 'UAE', rateVsSar: '0.98', rateVsUsd: '3.67' },
  { id: 'KWD', labelAr: 'دينار كويتي', labelEn: 'Kuwaiti Dinar', symbolAr: 'د.ك', symbolEn: 'KWD', flag: '🇰🇼', countryAr: 'الكويت', countryEn: 'Kuwait', rateVsSar: '0.082', rateVsUsd: '0.31' },
  { id: 'QAR', labelAr: 'ريال قطري', labelEn: 'Qatari Riyal', symbolAr: 'ر.ق', symbolEn: 'QAR', flag: '🇶🇦', countryAr: 'قطر', countryEn: 'Qatar', rateVsSar: '0.97', rateVsUsd: '3.64' },
  { id: 'BHD', labelAr: 'دينار بحريني', labelEn: 'Bahraini Dinar', symbolAr: 'د.ب', symbolEn: 'BHD', flag: '🇧🇭', countryAr: 'البحرين', countryEn: 'Bahrain', rateVsSar: '0.10', rateVsUsd: '0.38' },
  { id: 'OMR', labelAr: 'ريال عماني', labelEn: 'Omani Riyal', symbolAr: 'ر.ع', symbolEn: 'OMR', flag: '🇴🇲', countryAr: 'سلطنة عُمان', countryEn: 'Oman', rateVsSar: '0.10', rateVsUsd: '0.38' },
  { id: 'EGP', labelAr: 'جنيه مصري', labelEn: 'Egyptian Pound', symbolAr: 'ج.م', symbolEn: 'EGP', flag: '🇪🇬', countryAr: 'مصر', countryEn: 'Egypt', rateVsSar: '12.80', rateVsUsd: '48.0' },
  { id: 'EUR', labelAr: 'يورو أوروبي', labelEn: 'Euro', symbolAr: '€', symbolEn: 'EUR', flag: '🇪🇺', countryAr: 'الاتحاد الأوروبي', countryEn: 'European Union', rateVsSar: '0.25', rateVsUsd: '0.92' }
];

export function getCurrencyDetails(currencyId: string): CurrencyItem {
  const found = SUPPORTED_CURRENCIES.find(c => c.id === currencyId);
  if (found) return found;
  return SUPPORTED_CURRENCIES[0]; // default SAR
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
    'IQD': 'د.ع',
    'JOD': 'د.أ',
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
    'IQD': 'IQD',
    'JOD': 'JOD',
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

export interface CustomExchangeRates {
  iqdVsSar: number;
  jodVsSar: number;
  iqdVsUsd: number;
  jodVsUsd: number;
}

export const DEFAULT_EXCHANGE_RATES: CustomExchangeRates = {
  iqdVsSar: 349.33,
  jodVsSar: 0.189,
  iqdVsUsd: 1310.0,
  jodVsUsd: 0.709,
};

/**
 * Gets user-defined or approximate custom exchange rates stored locally in safeLocalStorage.
 */
export function getCustomExchangeRates(): CustomExchangeRates {
  if (typeof window === 'undefined') return DEFAULT_EXCHANGE_RATES;
  try {
    const raw = safeLocalStorage.getItem('saas_custom_exchange_rates');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        iqdVsSar: Number(parsed.iqdVsSar) > 0 ? Number(parsed.iqdVsSar) : DEFAULT_EXCHANGE_RATES.iqdVsSar,
        jodVsSar: Number(parsed.jodVsSar) > 0 ? Number(parsed.jodVsSar) : DEFAULT_EXCHANGE_RATES.jodVsSar,
        iqdVsUsd: Number(parsed.iqdVsUsd) > 0 ? Number(parsed.iqdVsUsd) : DEFAULT_EXCHANGE_RATES.iqdVsUsd,
        jodVsUsd: Number(parsed.jodVsUsd) > 0 ? Number(parsed.jodVsUsd) : DEFAULT_EXCHANGE_RATES.jodVsUsd,
      };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_EXCHANGE_RATES;
}

/**
 * Saves custom approximate exchange rates to local storage and alerts listeners.
 */
export function saveCustomExchangeRates(rates: Partial<CustomExchangeRates>): void {
  if (typeof window === 'undefined') return;
  const current = getCustomExchangeRates();
  const updated: CustomExchangeRates = {
    ...current,
    ...rates
  };
  safeLocalStorage.setItem('saas_custom_exchange_rates', JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('base-currency-changed', { detail: { currency: getBaseCurrency(), rates: updated } }));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Resets custom exchange rates to official defaults.
 */
export function resetCustomExchangeRates(): void {
  if (typeof window === 'undefined') return;
  safeLocalStorage.removeItem('saas_custom_exchange_rates');
  window.dispatchEvent(new CustomEvent('base-currency-changed', { detail: { currency: getBaseCurrency(), rates: DEFAULT_EXCHANGE_RATES } }));
  window.dispatchEvent(new Event('storage'));
}

/**
 * Toggles between Iraqi Dinar (IQD) and Jordanian Dinar (JOD).
 */
export function toggleIqdJodCurrency(): string {
  const current = getBaseCurrency();
  const next = current === 'IQD' ? 'JOD' : 'IQD';
  setBaseCurrency(next);
  return next;
}

/**
 * Returns conversion rate from SAR to selected currency.
 * The application's local maintenance/inventory costs are authored in SAR (ر.س).
 * Uses locally stored approximate rates for IQD and JOD.
 */
export function getConversionRateFromSAR(): number {
  const baseCurrency = getBaseCurrency();
  const customRates = getCustomExchangeRates();
  // 1 SAR equivalents
  const rates: Record<string, number> = {
    'SAR': 1.0,
    'USD': 0.27,      // 1 SAR = 0.266 USD
    'AED': 0.98,      // 1 SAR = 0.979 AED
    'IQD': customRates.iqdVsSar,    // 1 SAR = ~349.33 IQD (or custom saved rate)
    'JOD': customRates.jodVsSar,     // 1 SAR = ~0.189 JOD (or custom saved rate)
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
 * Uses locally stored approximate rates for IQD and JOD.
 */
export function getConversionRateFromUSD(): number {
  const baseCurrency = getBaseCurrency();
  const customRates = getCustomExchangeRates();
  // 1 USD equivalents
  const rates: Record<string, number> = {
    'SAR': 3.75,
    'USD': 1.0,
    'AED': 3.67,
    'IQD': customRates.iqdVsUsd,    // 1 USD = 1,310 IQD (or custom saved rate)
    'JOD': customRates.jodVsUsd,     // 1 USD = 0.709 JOD (or custom saved rate)
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

  const baseCurrency = getBaseCurrency();
  const maxDecimals = baseCurrency === 'IQD' ? 0 : baseCurrency === 'JOD' ? 3 : 2;

  const formatted = num.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
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
