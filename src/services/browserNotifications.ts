/**
 * Browser Push & Native Desktop Notification Manager
 * Handles HTML5 Web Notifications API, Service Worker Push notifications,
 * Web Audio chime alerts, and role-based notification settings.
 */

export interface BrowserNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notifyNewMaintenance: boolean;       // بلاغات الصيانة الجديدة
  notifyPeriodicDue: boolean;           // اقتراب موعد الصيانة الدورية (خلال 48 ساعة)
  notifyStatusChanged: boolean;         // تحديثات وتبديل حالة أوامر العمل
  notifyUrgentEmergency: boolean;       // البلاغات والنداءات الحرجة والطارئة
  notifyDefectsFound: boolean;          // أعطال فحص السلامة والفحص الفني
  minPriority: 'all' | 'high_only';     // مستوى الأهمية
  roleFilter: 'all' | 'technicians' | 'managers'; // تخصيص التنبيه للفنيين / الإداريين
}

export const DEFAULT_NOTIFICATION_SETTINGS: BrowserNotificationSettings = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  notifyNewMaintenance: true,
  notifyPeriodicDue: true,
  notifyStatusChanged: true,
  notifyUrgentEmergency: true,
  notifyDefectsFound: true,
  minPriority: 'all',
  roleFilter: 'all',
};

const STORAGE_KEY = 'fleet_browser_notifications_config';

/**
 * Check if the browser supports the Notifications API
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission state
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Load saved notification configuration from LocalStorage
 */
export function getNotificationSettings(): BrowserNotificationSettings {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_SETTINGS;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return DEFAULT_NOTIFICATION_SETTINGS;
  try {
    const parsed = JSON.parse(saved);
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch (e) {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save notification configuration to LocalStorage and dispatch change event
 */
export function saveNotificationSettings(settings: Partial<BrowserNotificationSettings>): BrowserNotificationSettings {
  const current = getNotificationSettings();
  const updated: BrowserNotificationSettings = { ...current, ...settings };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notification-settings-changed', { detail: updated }));
    window.dispatchEvent(new Event('storage'));
  }
  return updated;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<{
  granted: boolean;
  status: NotificationPermission | 'unsupported';
}> {
  if (!isNotificationSupported()) {
    return { granted: false, status: 'unsupported' };
  }

  try {
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    const granted = perm === 'granted';
    if (granted) {
      // Auto enable setting if permission granted
      saveNotificationSettings({ enabled: true });
    }
    return { granted, status: perm };
  } catch (error) {
    console.warn('Error requesting notification permission:', error);
    return { granted: false, status: Notification.permission };
  }
}

/**
 * Synthesize audio chime using Web Audio API (smooth notification bell sound without external MP3 files)
 */
export function playNotificationSound(type: 'urgent' | 'alert' | 'success' | 'chime' = 'alert'): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    // Resume context if suspended (browser autoplay policy)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'urgent') {
      // High-priority urgent double chime (dual frequency)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.setValueAtTime(1100, now + 0.12);
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(550, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (type === 'success') {
      // Pleasant harmonic chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.2, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } else {
      // Standard notification alert chime (E6 -> B5 -> G#5)
      const notes = [1318.51, 987.77, 830.61];
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.25, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.4);
      });
    }
  } catch (e) {
    console.debug('Audio chime playback omitted or unsupported:', e);
  }
}

/**
 * Trigger mobile vibration pattern if supported
 */
export function triggerVibration(pattern: number[] = [150, 80, 150]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  } catch (e) {}
}

export interface SendNotificationPayload {
  title?: string;
  titleAr?: string;
  titleEn?: string;
  body?: string;
  bodyAr?: string;
  bodyEn?: string;
  category?: 'maintenance' | 'periodic' | 'status' | 'urgent' | 'defect' | 'system' | 'new_maintenance' | 'periodic_due' | 'status_change' | 'defects';
  priority?: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  tag?: string;
  icon?: string;
  badge?: string;
  sound?: boolean | string;
  vibrate?: boolean;
  data?: any;
  onClick?: () => void;
}

/**
 * Dispatch a native browser push / desktop notification
 */
export async function sendBrowserNotification(payload: SendNotificationPayload): Promise<boolean> {
  const settings = getNotificationSettings();

  // Check master toggle
  if (!settings.enabled) return false;

  // Filter based on category
  if ((payload.category === 'maintenance' || payload.category === 'new_maintenance') && !settings.notifyNewMaintenance) return false;
  if ((payload.category === 'periodic' || payload.category === 'periodic_due') && !settings.notifyPeriodicDue) return false;
  if ((payload.category === 'status' || payload.category === 'status_change') && !settings.notifyStatusChanged) return false;
  if (payload.category === 'urgent' && !settings.notifyUrgentEmergency) return false;
  if ((payload.category === 'defect' || payload.category === 'defects') && !settings.notifyDefectsFound) return false;

  // Filter by priority
  if (settings.minPriority === 'high_only' && payload.priority && payload.priority !== 'high' && payload.priority !== 'urgent') {
    return false;
  }

  // Play sound if requested/enabled
  if (settings.soundEnabled && payload.sound !== false) {
    const soundType = payload.priority === 'urgent' || payload.category === 'urgent' 
      ? 'urgent' 
      : payload.sound === 'success' ? 'success' : 'alert';
    playNotificationSound(soundType);
  }

  // Trigger vibration if requested/enabled
  if (settings.vibrationEnabled && payload.vibrate !== false) {
    triggerVibration(payload.priority === 'urgent' ? [200, 100, 200, 100, 300] : [150, 80, 150]);
  }

  // Check Web Notification API support & permission
  if (!isNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const resolvedTitle = payload.title || payload.titleAr || payload.titleEn || 'تنبيه من نظام الأسطول';
  const resolvedBody = payload.body || payload.bodyAr || payload.bodyEn || '';

  const defaultIcon = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=128&auto=format&fit=crop&q=80';
  const notificationOptions: any = {
    body: resolvedBody,
    icon: payload.icon || defaultIcon,
    badge: payload.badge || defaultIcon,
    tag: payload.tag || `fleet-notif-${Date.now()}`,
    data: payload.data || {},
    silent: true, // We handle audio ourselves with Web Audio for high fidelity
    renotify: true,
  };

  try {
    // 1. Attempt Service Worker Notification if registered
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && 'showNotification' in registration) {
        await registration.showNotification(resolvedTitle, notificationOptions);
        return true;
      }
    }

    // 2. Standard Window Notification fallback
    const nativeNotif = new Notification(resolvedTitle, notificationOptions);
    nativeNotif.onclick = () => {
      window.focus();
      nativeNotif.close();
      if (payload.onClick) {
        payload.onClick();
      }
      // Dispatch tab navigation event if needed
      if (payload.data?.tab) {
        window.dispatchEvent(new CustomEvent('switch-app-tab', { detail: payload.data.tab }));
      }
    };
    return true;
  } catch (error) {
    console.warn('Native notification trigger failed:', error);
    return false;
  }
}

/**
 * Dispatch notification for a new maintenance request / urgent work order
 */
export async function notifyNewMaintenanceOrder(order: {
  id?: string;
  orderId?: string;
  vehicleId?: string;
  vehicleName?: string;
  plateNumber?: string;
  description: string;
  priority: 'low' | 'normal' | 'medium' | 'high' | 'urgent';
  technicianName?: string;
}): Promise<boolean> {
  const isUrgent = order.priority === 'urgent' || order.priority === 'high';
  const orderIdentifier = order.orderId || order.id || 'N/A';
  const title = isUrgent
    ? `🚨 بلاغ صيانة طارئ جديد! [${order.priority === 'urgent' ? 'حرج جداً' : 'عالي الأولوية'}]`
    : `🔧 بلاغ صيانة جديد: أمر عمل #${orderIdentifier}`;

  const vehText = order.vehicleName 
    ? `${order.vehicleName}${order.plateNumber ? ` (${order.plateNumber})` : ''}` 
    : `مركبة #${order.vehicleId || 'مجهولة'}`;

  const body = `تم تسجيل طلب صيانة للمركبة: ${vehText}\nالبيان: ${order.description}\nالفني المكلف: ${order.technicianName || 'قيد التعيين'}`;

  return sendBrowserNotification({
    title,
    body,
    category: isUrgent ? 'urgent' : 'maintenance',
    priority: order.priority,
    tag: `new-order-${orderIdentifier}`,
    data: { tab: 'maintenance', orderId: orderIdentifier }
  });
}

/**
 * Dispatch notification when scheduled periodic maintenance is approaching (48 hours or overdue)
 */
export async function notifyPeriodicMaintenanceDue(schedule: {
  id?: string;
  vehicleName: string;
  plateNumber?: string;
  title?: string;
  serviceTitle?: string;
  dueDate: string;
  hoursRemaining?: number;
  daysLeft?: number;
  isOverdue?: boolean;
}): Promise<boolean> {
  const isOverdue = schedule.isOverdue || (schedule.hoursRemaining !== undefined && schedule.hoursRemaining <= 0);
  const taskTitle = schedule.serviceTitle || schedule.title || 'صيانة وقائية دورية';
  const hoursLeft = schedule.hoursRemaining || (schedule.daysLeft ? schedule.daysLeft * 24 : 48);
  const title = isOverdue
    ? `⚠️ تنبيه حرج: موعد صيانة دورية متأخر! (${schedule.vehicleName})`
    : `⏰ تنبيه اقتراب موعد صيانة دورية (خلال ${Math.round(hoursLeft)} ساعة)`;

  const vehText = `${schedule.vehicleName}${schedule.plateNumber ? ` (${schedule.plateNumber})` : ''}`;
  const body = `المركبة: ${vehText}\nالخدمة المطلوبة: ${taskTitle}\nتاريخ الاستحقاق: ${schedule.dueDate}\nيرجى تحضير قطع الغيار وحجز منفذ الورشة.`;

  return sendBrowserNotification({
    title,
    body,
    category: 'periodic',
    priority: isOverdue ? 'urgent' : 'high',
    tag: `pm-due-${schedule.id || Date.now()}`,
    data: { tab: 'periodic-maintenance', scheduleId: schedule.id }
  });
}

/**
 * Dispatch notification when maintenance order status changes
 */
export async function notifyOrderStatusChanged(detail: {
  orderId: string;
  vehicleName: string;
  oldStatus: string;
  newStatus: string;
  description?: string;
  technicianName?: string;
}): Promise<boolean> {
  const statusLabelsAr: Record<string, string> = {
    'pending': 'قيد الانتظار ⏳',
    'in-progress': 'جاري العمل والإصلاح ⚙️',
    'completed': 'مكتمل بنجاح ✓'
  };

  const newLabel = statusLabelsAr[detail.newStatus] || detail.newStatus;
  const isCompleted = detail.newStatus === 'completed';

  const title = isCompleted
    ? `✅ اكتمال صيانة المركبة (${detail.vehicleName})`
    : `🔄 تحديث حالة أمر الصيانة #${detail.orderId}`;

  const body = `المركبة: ${detail.vehicleName}\nالحالة الجديدة: [${newLabel}]\nالتفاصيل: ${detail.description || 'تم تحديث سجل العمليات'}`;

  return sendBrowserNotification({
    title,
    body,
    category: 'status',
    priority: isCompleted ? 'medium' : 'low',
    tag: `status-change-${detail.orderId}-${Date.now()}`,
    data: { tab: 'maintenance', orderId: detail.orderId }
  });
}

/**
 * Dispatch notification when safety or technical inspection discovers defects
 */
export async function notifyDefectsDetected(detail: {
  vehicleName: string;
  plateNumber?: string;
  defectCount: number;
  criticalDefects?: string[];
  inspectorName?: string;
}): Promise<boolean> {
  const title = `🚨 تنبيه فحص فني: تم رصد ${detail.defectCount} ملاحظات/أعطال في المركبة`;
  const vehText = `${detail.vehicleName}${detail.plateNumber ? ` (${detail.plateNumber})` : ''}`;
  const critText = detail.criticalDefects && detail.criticalDefects.length > 0 
    ? `\nالأعطال الحرجة: ${detail.criticalDefects.slice(0, 2).join('، ')}`
    : '';

  const body = `المركبة: ${vehText}\nالفاحص: ${detail.inspectorName || 'الفريق الميداني'}${critText}\nيتطلب مراجعة فورية في مركز الصيانة.`;

  return sendBrowserNotification({
    title,
    body,
    category: 'defect',
    priority: 'urgent',
    tag: `defect-${Date.now()}`,
    data: { tab: 'safety-inspection' }
  });
}

/**
 * Send an immediate test notification to verify browser push & sound setup
 */
export async function sendTestNotification(): Promise<boolean> {
  const perm = getNotificationPermission();
  if (perm !== 'granted') {
    const res = await requestNotificationPermission();
    if (!res.granted) return false;
  }

  return sendBrowserNotification({
    title: '🔔 إشعار تجريبي ناجح من نظام إدارة الأسطول والصيانة',
    body: 'نظام إشعارات المتصفح الفورية (Push) متصل ونشط بكفاءة! ستتلقى التنبيهات الفورية للبلاغات وأوامر الصيانة الجديدة.',
    category: 'system',
    priority: 'high',
    sound: true,
    vibrate: true,
    tag: `test-notif-${Date.now()}`
  });
}
