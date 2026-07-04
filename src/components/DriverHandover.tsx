import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Printer, 
  Calendar, 
  User, 
  Truck, 
  ShieldAlert, 
  Camera, 
  PenTool, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  X, 
  Check, 
  Clock, 
  AlertCircle,
  FileText,
  Gauge,
  Droplet,
  ChevronLeft,
  Briefcase,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, Driver } from '../types';

interface HandoverRecord {
  id: string;
  orderNumber: string;
  type: 'incoming' | 'outgoing'; // Incoming = driver returns, Outgoing = driver takes custody
  maintenanceStatus: 'pre' | 'post' | 'routine'; // Pre-maintenance, Post-maintenance, Routine
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  employeeName: string; // Attesting employee
  date: string;
  odometer: number;
  fuelLevel: number; // Percentage 0 - 100
  checklist: {
    engineHydraulics: 'ok' | 'fail' | 'na';
    brakesBattery: 'ok' | 'fail' | 'na';
    bodyPaint: 'ok' | 'fail' | 'na';
    tiresAxles: 'ok' | 'fail' | 'na';
    lightsIndicators: 'ok' | 'fail' | 'na';
    safetyEquipment: 'ok' | 'fail' | 'na';
    cleanliness: 'ok' | 'fail' | 'na';
  };
  damageNotes: string;
  images: string[]; // Base64 strings or placeholders
  signatureData: string; // Signature canvas image as Base64 data URL
  certified: boolean;
}

interface DriverHandoverProps {
  user: any;
}

export default function DriverHandover({ user }: DriverHandoverProps) {
  // Lists
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [records, setRecords] = useState<HandoverRecord[]>([]);
  
  // UI State
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'create'>('list');
  const [filterType, setFilterType] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [filterMaint, setFilterMaint] = useState<'all' | 'pre' | 'post' | 'routine'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<HandoverRecord | null>(null);
  
  // Form State
  const [newRecord, setNewRecord] = useState<Omit<HandoverRecord, 'id' | 'orderNumber' | 'certified'>>({
    type: 'outgoing',
    maintenanceStatus: 'pre',
    vehicleId: '',
    vehicleName: '',
    vehiclePlate: '',
    driverId: '',
    driverName: '',
    employeeName: user.name || 'المهندس خالد',
    date: new Date().toISOString().split('T')[0],
    odometer: 125000,
    fuelLevel: 75,
    checklist: {
      engineHydraulics: 'ok',
      brakesBattery: 'ok',
      bodyPaint: 'ok',
      tiresAxles: 'ok',
      lightsIndicators: 'ok',
      safetyEquipment: 'ok',
      cleanliness: 'ok',
    },
    damageNotes: '',
    images: [],
    signatureData: '',
  });

  // Photo Uploader Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Premeditated Damage Simulation Photos
  const DEMO_DAMAGES = [
    { title: 'خدش في الصدام الخلفي', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300' },
    { title: 'بروز ميكانيكي بالإطارات', url: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=300' },
    { title: 'كسر في مرآة السائق الجانبية', url: 'https://images.unsplash.com/photo-1600706432502-75110c14f6b3?auto=format&fit=crop&q=80&w=300' }
  ];

  // Load Vehicles, Drivers and Existing Handover Records on Mount
  useEffect(() => {
    // 1. Load Vehicles
    const savedVehicles = localStorage.getItem('fleet_vehicles_v2');
    if (savedVehicles) {
      try {
        setVehicles(JSON.parse(savedVehicles));
      } catch (e) {
        console.error('Error parsing vehicles', e);
      }
    } else {
      // Fallback
      import('../data').then(m => setVehicles(m.vehicles)).catch(() => {});
    }

    // 2. Load Drivers
    const savedDrivers = localStorage.getItem('fleet_drivers_v2');
    if (savedDrivers) {
      try {
        setDrivers(JSON.parse(savedDrivers));
      } catch (e) {
        console.error('Error parsing drivers', e);
      }
    } else {
      // Fallback
      import('../data').then(m => {
        // Fallback or empty
      }).catch(() => {});
    }

    // 3. Load Handover Records
    const savedRecords = localStorage.getItem('fleet_driver_handovers_v1');
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {
        console.error('Error parsing handover records', e);
      }
    } else {
      // Create some beautiful mock handover records for direct visualization and dashboard readiness
      const mockHandovers: HandoverRecord[] = [
        {
          id: 'H-901',
          orderNumber: 'HND-2026-001',
          type: 'outgoing',
          maintenanceStatus: 'pre',
          vehicleId: '1',
          vehicleName: 'تويوتا بيك أب - هايلوكس',
          vehiclePlate: 'أ ب ج 1234',
          driverId: 'd1',
          driverName: 'سلمان الفهد',
          employeeName: 'المهندس خالد',
          date: '2026-06-08',
          odometer: 142100,
          fuelLevel: 80,
          checklist: {
            engineHydraulics: 'ok',
            brakesBattery: 'ok',
            bodyPaint: 'fail',
            tiresAxles: 'ok',
            lightsIndicators: 'ok',
            safetyEquipment: 'ok',
            cleanliness: 'ok',
          },
          damageNotes: 'ملاحظة خدوش بسيطة بجانب الرفرف الأيسر الأمامي عند التسليم قبل إدخال الورشة.',
          images: ['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300'],
          signatureData: 'mock',
          certified: true
        },
        {
          id: 'H-902',
          orderNumber: 'HND-2026-002',
          type: 'incoming',
          maintenanceStatus: 'post',
          vehicleId: '3',
          vehicleName: 'حافلة هيونداي سيتي',
          vehiclePlate: 'ز ح ط 9012',
          driverId: 'd2',
          driverName: 'عبدالعزيز الحربي',
          employeeName: 'المهندس خالد',
          date: '2026-06-09',
          odometer: 289430,
          fuelLevel: 100,
          checklist: {
            engineHydraulics: 'ok',
            brakesBattery: 'ok',
            bodyPaint: 'ok',
            tiresAxles: 'ok',
            lightsIndicators: 'ok',
            safetyEquipment: 'ok',
            cleanliness: 'ok',
          },
          damageNotes: 'تم استلام الحافلة بعد انتهاء صيانة التكييف المركزي بالكامل مع تنظيف كابينة الركاب ومطابقة ضغط الإطارات.',
          images: [],
          signatureData: 'mock',
          certified: true
        }
      ];
      setRecords(mockHandovers);
      localStorage.setItem('fleet_driver_handovers_v1', JSON.stringify(mockHandovers));
    }
  }, []);

  // Update selected vehicle information when selection changes in Form
  useEffect(() => {
    if (newRecord.vehicleId) {
      const selectedVeh = vehicles.find(v => v.id === newRecord.vehicleId);
      if (selectedVeh) {
        setNewRecord(prev => ({
          ...prev,
          vehicleName: selectedVeh.name,
          vehiclePlate: selectedVeh.plateNumber,
          odometer: selectedVeh.lastMaintenance ? 124500 : 154000 // Just a realistic default
        }));
      }
    }
  }, [newRecord.vehicleId, vehicles]);

  // Update selected driver name when selection changes
  useEffect(() => {
    if (newRecord.driverId) {
      const selectedDri = drivers.find(d => d.id === newRecord.driverId);
      if (selectedDri) {
        setNewRecord(prev => ({
          ...prev,
          driverName: selectedDri.name
        }));
      }
    }
  }, [newRecord.driverId, drivers]);

  // Handle local File Upload (Base64 conversion)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewRecord(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  // Drag and Drop simulation upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewRecord(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }));
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  // Simulation damage selection helper
  const addDemoDamagePhoto = (url: string) => {
    setNewRecord(prev => ({
      ...prev,
      images: [...prev.images, url]
    }));
  };

  const removePhoto = (index: number) => {
    setNewRecord(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // --- SIGNATURE CANVAS ENGINE ---
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep Navy
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x = 0, y = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    // Save signature directly into model
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setNewRecord(prev => ({
        ...prev,
        signatureData: dataUrl
      }));
    }
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setNewRecord(prev => ({
      ...prev,
      signatureData: ''
    }));
  };

  // Submit and save handover document
  const handleSubmitHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.vehicleId || !newRecord.driverId) {
      alert('الرجاء اختيار المركبة والسائق لإتمام محضر الاستلام والمسؤولية القانونية.');
      return;
    }

    const uniqueId = 'H-' + Math.floor(100 + Math.random() * 900);
    const orderNumber = `HND-2026-${Math.floor(100 + Math.random() * 900)}`;
    const finalDocument: HandoverRecord = {
      ...newRecord,
      id: uniqueId,
      orderNumber,
      certified: true
    };

    const updated = [finalDocument, ...records];
    setRecords(updated);
    localStorage.setItem('fleet_driver_handovers_v1', JSON.stringify(updated));

    // Reset Form
    setNewRecord({
      type: 'outgoing',
      maintenanceStatus: 'pre',
      vehicleId: '',
      vehicleName: '',
      vehiclePlate: '',
      driverId: '',
      driverName: '',
      employeeName: user.name || 'المهندس خالد',
      date: new Date().toISOString().split('T')[0],
      odometer: 125000,
      fuelLevel: 75,
      checklist: {
        engineHydraulics: 'ok',
        brakesBattery: 'ok',
        bodyPaint: 'ok',
        tiresAxles: 'ok',
        lightsIndicators: 'ok',
        safetyEquipment: 'ok',
        cleanliness: 'ok',
      },
      damageNotes: '',
      images: [],
      signatureData: '',
    });

    // Clear Signature Canvas
    setTimeout(clearSignature, 100);

    // Turn back to list view
    setActiveSubTab('list');
  };

  // Delete a record safely
  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('هل أنت متأكد من حذف هذا المحضر المؤرشف؟')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('fleet_driver_handovers_v1', JSON.stringify(updated));
    }
  };

  // Custom official document printing trigger
  const handlePrintDocument = (record: HandoverRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const checklistLabels: Record<keyof HandoverRecord['checklist'], string> = {
      engineHydraulics: 'سلامة المحرك وهيدروليك الرفع وتدفق الضغط',
      brakesBattery: 'سلامة الفرامل، البطارية، وأنظمة السلامة الكهربائية',
      bodyPaint: 'حالة هيكل المركبة الخارجي والدهانات والخدوش',
      tiresAxles: 'ضغط وهواء ونقشة الإطارات وسلامة المحاور الفنية',
      lightsIndicators: 'الأنوار الرئيسية، الإشارات الجانبية والتنبيه الكهربائي',
      safetyEquipment: 'حقيبة الطوارئ، طفاية المعايرة ومعدات الاستباط',
      cleanliness: 'نظافة الكبينة الداخلية وأجهزة الكونسول ومستوى الراحة',
    };

    const statusLabels = {
      ok: '✅ سليم وصالح للاستعمال',
      fail: '❌ يوجد عطل أو خلل فني',
      na: '➖ غير متوفر / لا ينطبق',
    };

    const statusBadgeClass = {
      ok: 'color: #059669; font-weight: bold;',
      fail: 'color: #dc2626; font-weight: bold;',
      na: 'color: #4b5563; font-style: italic;',
    };

    printWindow.document.write(`
      <html>
        <head>
          <title>${record.orderNumber} - محضر استلام فني</title>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Cairo', sans-serif; 
              direction: rtl; 
              padding: 40px; 
              color: #1e293b;
              background-color: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px double #0284c7;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title {
              text-align: center;
            }
            .title h1 {
              margin: 0;
              font-size: 22px;
              font-weight: 900;
              color: #0c4a6e;
            }
            .title p {
              margin: 5px 0 0 0;
              font-size: 11px;
              color: #64748b;
              letter-spacing: 1px;
            }
            .meta-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 15px;
              margin-bottom: 30px;
              background: #f8fafc;
              padding: 20px;
              border-radius: 12px;
              border: 1px solid #e2e8f0;
            }
            .meta-item {
              font-size: 13px;
              line-height: 1.8;
            }
            .meta-item strong {
              color: #0f172a;
            }
            .section-title {
              font-size: 15px;
              font-weight: 900;
              color: #0284c7;
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 8px;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            .checklist-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .checklist-table th, .checklist-table td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: right;
              font-size: 12px;
            }
            .checklist-table th {
              background-color: #f1f5f9;
              color: #0f172a;
              font-weight: bold;
            }
            .notes-box {
              border: 1px solid #e2e8f0;
              background-color: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              font-size: 12px;
              line-height: 1.6;
              margin-bottom: 30px;
              min-height: 60px;
            }
            .sign-section {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .signature-box {
              width: 45%;
              border: 1px dashed #cbd5e1;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              font-size: 12px;
              background-color: #fafafa;
            }
            .signature-img {
              max-height: 85px;
              margin: 10px auto;
              display: block;
            }
            .stamp {
              position: absolute;
              border: 3px solid #059669;
              color: #059669;
              border-radius: 50%;
              width: 90px;
              height: 90px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 900;
              text-transform: uppercase;
              transform: rotate(-15deg);
              opacity: 0.65;
              top: 60px;
              left: 60px;
            }
            .banner {
              background-color: #e0f2fe;
              color: #0369a1;
              padding: 8px 15px;
              border-radius: 6px;
              font-size: 12px;
              font-weight: bold;
              text-align: center;
              margin-top: 15px;
              margin-bottom: 15px;
            }
          </style>
        </head>
        <body>
          <div style="position: relative;">
            <div class="stamp">معتمد ومأمور</div>
            <div class="header">
              <div>
                <h3 style="margin: 0; color: #0284c7; font-weight: 900; font-size: 16px;">ميكانيك 360</h3>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b;">حفظ أمان وجودة أسطول المركبات</p>
              </div>
              <div class="title">
                <h1>محضر رسمي لتسليم واستلام العجلات الفنية</h1>
                <p>DOCUMENT ID: ${record.orderNumber}</p>
              </div>
              <div style="text-align: left;">
                <p style="margin: 0; font-size: 11px; font-weight: bold;">بتاريخ: ${record.date}</p>
                <p style="margin: 3px 0 0 0; font-size: 10px; color: #64748b;">حالة المستند: <span style="color:#059669;font-weight:bold;">موقّع ورسمي</span></p>
              </div>
            </div>

            <div class="banner">
              ${record.type === 'outgoing' ? 'تعهد تسليم المركبة ونقل المسؤولية التقنية والمدنية بذمة السائق' : 'محضر فك المسؤولية وإرجاع الآلية لعهدة قسم الصيانة والمجموعة الفنية'}
            </div>

            <div class="section-title">بيانات الأطراف والآلية الميكانيكية</div>
            <div class="meta-grid">
              <div class="meta-item">
                <strong>المركبة / الآلية الميكانيكية:</strong> ${record.vehicleName}<br/>
                <strong>لوحة الآلية الرسمية:</strong> ${record.vehiclePlate}<br/>
                <strong>قراءة العداد عند الإجراء:</strong> ${record.odometer.toLocaleString()} كم
              </div>
              <div class="meta-item">
                <strong>اسم السائق المفوض بالعهدة:</strong> ${record.driverName}<br/>
                <strong>ضابط المزامنة والمراقبة:</strong> ${record.employeeName}<br/>
                <strong>حالة الوقود الحالية:</strong> ${record.fuelLevel}% من سعة الخزان القصوى
              </div>
            </div>

            <div class="section-title">جدول الفحص الفني والتحقق من الجودة الشاملة</div>
            <table class="checklist-table">
              <thead>
                <tr>
                  <th style="width: 50%;">العناصر والأنظمة المفحوصة في الآلية</th>
                  <th style="width: 50%; text-align: center;">التقييم التقني وحالة الأمان</th>
                </tr>
              </thead>
              <tbody>
                ${Object.entries(record.checklist).map(([key, value]) => `
                  <tr>
                    <td>${checklistLabels[key as keyof HandoverRecord['checklist']]}</td>
                    <td style="text-align: center; ${statusBadgeClass[value as 'ok'|'fail'|'na']}">${statusLabels[value as 'ok'|'fail'|'na']}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title text-sm">ملاحظات العيوب والكسور والتلفيات الموصوفة</div>
            <div class="notes-box">
              ${record.damageNotes || 'لا توجد أية ملاحظات استثنائية أو عيوب مرصودة بالهيكل أو الأنظمة الميكانيكية. تم التسليم بالوضع السليم الكلي.'}
            </div>

            <div class="sign-section">
              <div class="signature-box">
                <strong>توقيع مصادقة سائق العجلة الرسمية</strong>
                <p style="font-size:10px; color:#64748b; margin-top:2px;">لقد قمت بفحص العجلة الميكانيكية الموضحة أعلاه وأقر بتحمل كامل المسؤولية المدنية والجنائية طوال فترة حيازتي لها.</p>
                ${record.signatureData && record.signatureData !== 'mock' ? `<img src="${record.signatureData}" class="signature-img"/>` : `<div style="margin: 25px 0; color:#cbd5e1; font-style:italic;">تم التوقيع الإلكتروني بمطابقة بصمة الـ SaaS</div>`}
                <span style="font-size: 11px; font-weight: bold;">(السائق: ${record.driverName})</span>
              </div>
              <div class="signature-box">
                <strong>توقيع واعتماد ضابط الفحص الفني</strong>
                <p style="font-size:10px; color:#64748b; margin-top:2px;">أصادق أنا الفني المشرف على مطابقتي للبيانات المذكورة وحياديتها وسلامة عجلات وسلامة فحص الآلية بالقسم.</p>
                <div style="margin: 20px 0; font-family:'Courier New', monospace; font-size:11px; font-weight:bold; color:#0284c7;">
                  [ميكانيك 360 - تم الفحص والاعتداد]<br/>ID: SIG-8594-SEC
                </div>
                <span style="font-size: 11px; font-weight: bold;">(المراقب: ${record.employeeName})</span>
              </div>
            </div>

            <div style="margin-top:40px; text-align:center; font-size:10px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:15px;">
              مطابق لنظام الحوكمة الرقمي لحساب الأساطيل ومدرج آلياً بالسجل الموحد لجرائم وهدر المركبات.
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Helper labels for types
  const typeLabels = {
    incoming: 'استلام عهدة (إرجاع للقسم)',
    outgoing: 'تسليم عهدة (بذمة السائق)',
  };

  const maintTypeLabels = {
    pre: 'قبل أمر الصيانة 🔧',
    post: 'بعد انتهاء الصيانة ✔',
    routine: 'نقل/تفويض دوري اعتيادي 📋',
  };

  // Filter records
  const filteredRecords = records.filter(rec => {
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      rec.vehicleName.toLowerCase().includes(searchLower) ||
      rec.vehiclePlate.toLowerCase().includes(searchLower) ||
      rec.driverName.toLowerCase().includes(searchLower) ||
      rec.orderNumber.toLowerCase().includes(searchLower);

    // Type filter
    const matchType = filterType === 'all' || rec.type === filterType;

    // Maintenance Status filter
    const matchMaint = filterMaint === 'all' || rec.maintenanceStatus === filterMaint;

    return matchSearch && matchType && matchMaint;
  });

  // Calculate high quality stats
  const totalIncoming = records.filter(r => r.type === 'incoming').length;
  const totalOutgoing = records.filter(r => r.type === 'outgoing').length;
  const totalDamagesFound = records.filter(r => 
    r.checklist.bodyPaint === 'fail' || 
    r.checklist.engineHydraulics === 'fail' || 
    r.checklist.tiresAxles === 'fail'
  ).length;

  return (
    <div className="space-y-6" id="driver-handover-canvas">
      {/* Header section styled elegantly like dashboard */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs" dir="rtl">
        <div>
          <span className="text-[10px] font-black tracking-widest uppercase text-brand-blue-600 bg-brand-blue-50 dark:bg-brand-blue-950/40 px-2.5 py-1 rounded-full border border-brand-blue-200/40">
            الحوكمة والأمان الرقمي للآليات
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mt-2">
            محاضر تسليم واستلام العجلات الفنية
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-normal max-w-xl">
            نظام ومحاضر فحص ونقل عهدة الآليات في المرفق قبل وبعد الصيانة بالتوقيع والتوثيق الإلكتروني لضمان جودة الاستلام وإثبات الأضرار.
          </p>
        </div>

        <button
          onClick={() => {
            setActiveSubTab(activeSubTab === 'list' ? 'create' : 'list');
            setSelectedRecord(null);
          }}
          className="px-4 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-black text-xs rounded-2xl transition-all shadow-md hover:scale-[1.02] flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
        >
          {activeSubTab === 'list' ? (
            <>
              <Plus size={15} />
              <span>تحرير محضر فحص وتسليم جديد</span>
            </>
          ) : (
            <>
              <ChevronLeft size={15} />
              <span>العودة لجدول الأرشيف الموحد</span>
            </>
          )}
        </button>
      </div>

      {/* Statistics board focused on Quality Control */}
      {activeSubTab === 'list' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-violet-500 to-indigo-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center shadow-inner">
                <FileText size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">إجمالي محاضر العهدة</span>
                <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{records.length} وثيقة</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-brand-blue-500 to-cyan-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-blue-50/50 dark:bg-brand-blue-950/40 text-brand-blue-600 dark:text-brand-blue-405 rounded-2xl flex items-center justify-center shadow-inner">
                <Truck size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">عجلات بذمة السائقين (صادرة)</span>
                <span className="text-sm font-black text-brand-blue-600 dark:text-brand-blue-400 font-mono">{totalOutgoing} مرخصة</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-emerald-500 to-teal-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-2xl flex items-center justify-center shadow-inner">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">عجلات عائدة ومستلمة للمرفق</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-550 font-mono">{totalIncoming} آلية</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-rose-500 to-amber-500" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-450 rounded-2xl flex items-center justify-center shadow-inner">
                <ShieldAlert size={18} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block">ملاحظات تلفيات فنية مرصودة</span>
                <span className="text-sm font-black text-rose-600 dark:text-rose-450 font-mono">{totalDamagesFound} عطل</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT PANELS */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'list' ? (
          <motion.div
            key="list-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4"
          >
            {/* Filter and control bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs flex flex-col md:flex-row md:items-center gap-3 justify-between" dir="rtl">
              <div className="relative max-w-md w-full">
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                  <Search size={14} />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث برقم المحضر، اسم السائق، أو اللوحة والمعدّة..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 focus:border-brand-blue-450 rounded-2xl text-xs font-bold outline-none dark:text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Outgoing vs Incoming Filter */}
                <select 
                  value={filterType}
                  onChange={(e: any) => setFilterType(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 px-3 py-2 rounded-2xl text-xs font-black outline-none block text-right"
                >
                  <option value="all">كل اتجاهات التسليم</option>
                  <option value="outgoing">تسليم عهدة (للخارج)</option>
                  <option value="incoming">استلام وتسلّم (للداخل)</option>
                </select>

                {/* Maintenance stage link check */}
                <select
                  value={filterMaint}
                  onChange={(e: any) => setFilterMaint(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-955 border border-slate-105 dark:border-slate-850 px-3 py-2 rounded-2xl text-xs font-black outline-none block text-right"
                >
                  <option value="all">كل مراحل الصيانة</option>
                  <option value="pre">قبل الصيانة 🔧</option>
                  <option value="post">بعد انتهاء الصيانة ✔</option>
                  <option value="routine">دوري اعتيادي 📋</option>
                </select>
              </div>
            </div>

            {/* List Table Grid or Empty view */}
            {filteredRecords.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs" dir="rtl">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-950/40 text-slate-400 mx-auto rounded-full flex items-center justify-center shadow-inner">
                  <ClipboardCheck size={28} />
                </div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-4">لا توجد أية محاضر تسليم مسجلة حالياً</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-2 max-w-sm mx-auto leading-normal">
                  قم بتحرير أول محضر رسمي لتسليم عهدة أو فك تسلّم لمطابقة الأضرار قبل أو بعد إدخالها ورش الأساطيل.
                </p>
                <button
                  onClick={() => setActiveSubTab('create')}
                  className="mt-4 px-4 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white font-black text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  تحرير أول محضر إلكتروني الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
                {filteredRecords.map((record) => {
                  const hasFails = Object.values(record.checklist).some(val => val === 'fail');

                  return (
                    <div 
                      key={record.id}
                      onClick={() => setSelectedRecord(record)}
                      className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-brand-blue-200 dark:hover:border-slate-700 shadow-3xs transition-all cursor-pointer group flex flex-col justify-between space-y-3.5 relative"
                    >
                      {/* Sub-badge indicating type with background glow */}
                      <span className={`absolute top-0 right-6 left-6 h-0.5 rounded-full ${
                        record.type === 'outgoing' ? 'bg-brand-blue-500' : 'bg-emerald-500'
                      }`} />

                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <span className="text-[10px] font-black font-mono text-brand-blue-600 dark:text-brand-blue-400 block">{record.orderNumber}</span>
                          <h4 className="text-[13px] font-black text-slate-900 dark:text-white mt-1 group-hover:text-brand-blue-500 transition-colors">{record.vehicleName}</h4>
                          <span className="text-[9.5px] font-mono text-slate-450 block mt-0.5">{record.vehiclePlate}</span>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            record.type === 'outgoing' 
                              ? 'bg-brand-blue-50 dark:bg-brand-blue-950/30 text-brand-blue-600' 
                              : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                          }`}>
                            {typeLabels[record.type]}
                          </span>
                          <span className="text-[8px] font-bold text-slate-400">{record.date}</span>
                        </div>
                      </div>

                      {/* Diagnostic details */}
                      <div className="bg-slate-50/50 dark:bg-slate-950/40 p-2.5 rounded-2xl border border-slate-100/40 dark:border-slate-850 text-[10.5px] space-y-1.5 font-bold">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-450 dark:text-slate-500">حيازة السائق:</span>
                          <span className="text-slate-800 dark:text-slate-300 font-extrabold">{record.driverName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-455 dark:text-slate-500">مرحلة الفحص:</span>
                          <span className="text-slate-705 dark:text-slate-400 font-extrabold">{maintTypeLabels[record.maintenanceStatus]}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-455 dark:text-slate-500">قراءة العداد:</span>
                          <span className="text-slate-800 dark:text-slate-300 font-mono font-black">{record.odometer.toLocaleString()} كم</span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-850/60 text-[9px]">
                          <span className="text-slate-400">حالة الفحص الفني:</span>
                          {hasFails ? (
                            <span className="text-rose-600 dark:text-rose-450 font-black flex items-center gap-0.5 animate-pulse">⚠️ يوجد تلفيات / أعطال</span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-black">✓ فحص فني سليم كلياً</span>
                          )}
                        </div>
                      </div>

                      {/* Card actions line */}
                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850/60 pt-2.5">
                        <span className="inline-flex items-center gap-1 text-[9.5px] text-slate-450 dark:text-slate-500">
                          <Clock size={10} />
                          <span>بإشراف: {record.employeeName}</span>
                        </span>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handlePrintDocument(record)}
                            className="p-1 text-slate-400 hover:text-brand-blue-500 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                            title="طباعة محضر التسليم والدليل الفني"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteRecord(record.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-lg transition-colors"
                            title="حذف المحضر"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="create-panel"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-3xs p-6"
            dir="rtl"
          >
            {/* Elegant wizard subtitle representing high craftsmanship */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-widest leading-none">شعبة جودة الأساطيل الرقمية</span>
              <h2 className="text-md sm:text-lg font-black text-slate-900 dark:text-white mt-1">تحرير محضر فني لنقل عهدة المركبة</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                الرجاء تعبئة تفاصيل الفحص وتصوير أو تحديد الأضرار لفرض المسؤولية القانونية وحفظ حالة العجلات بالكامل.
              </p>
            </div>

            <form onSubmit={handleSubmitHandover} className="space-y-6">
              {/* Grid 1: Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Outgoing vs Incoming toggle */}
                <div className="space-y-1.5 text-right">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-450 block">نوع محضر ومستند العهدة</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewRecord(prev => ({ ...prev, type: 'outgoing' }))}
                      className={`p-2.5 rounded-2xl text-[11px] font-black border text-center transition-all cursor-pointer ${
                        newRecord.type === 'outgoing'
                          ? 'bg-brand-blue-500 text-white border-brand-blue-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-100 dark:border-slate-850 hover:border-slate-200'
                      }`}
                    >
                      تسليم عهدة (للسائق)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRecord(prev => ({ ...prev, type: 'incoming' }))}
                      className={`p-2.5 rounded-2xl text-[11px] font-black border text-center transition-all cursor-pointer ${
                        newRecord.type === 'incoming'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-950 text-slate-650 dark:text-slate-400 border-slate-100 dark:border-slate-850 hover:border-slate-200'
                      }`}
                    >
                      استلام عهدة (من السائق)
                    </button>
                  </div>
                </div>

                {/* Maintenance stage */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block">صلة أو مرحلة أمر الصيانة الموقوف</label>
                  <select
                    value={newRecord.maintenanceStatus}
                    onChange={(e: any) => setNewRecord(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-[11px] font-black outline-none block text-right dark:text-white"
                  >
                    <option value="pre">فحص قبل الصيانة والتشخيص (Pre-maint)</option>
                    <option value="post">طرد واستلام بعد انتهاء أعمال الورشة (Post-maint)</option>
                    <option value="routine">تسليم اعتيادي وقائي خارج الورش (Routine)</option>
                  </select>
                </div>

                {/* Attesting officer */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block">الضابط الفحصي المشرف</label>
                  <input
                    type="text"
                    value={newRecord.employeeName}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, employeeName: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs font-bold outline-none dark:text-white"
                  />
                </div>
              </div>

              {/* Grid 2: Entities selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Vehicle Selector */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block">المركبة أو الآلية المراد تسليمها/استلامها</label>
                  <select
                    value={newRecord.vehicleId}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, vehicleId: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-[11px] font-black outline-none block text-right dark:text-white"
                  >
                    <option value="">-- اختر المركبة من قائمة الأسطول --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>{v.name} ({v.plateNumber})</option>
                    ))}
                  </select>
                </div>

                {/* Driver Selector */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block">السائق القانوني المستلم للعهدة</label>
                  <select
                    value={newRecord.driverId}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, driverId: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-[11px] font-black outline-none block text-right dark:text-white"
                  >
                    <option value="">-- اختر السائق لتسجيل التعهد --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                    ))}
                  </select>
                </div>

                {/* Odometer */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block flex items-center justify-between">
                    <span>قراءة عداد المسافة الحالية</span>
                    <span className="text-[9.5px] text-brand-blue-500 font-mono">كم</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                      <Gauge size={13} />
                    </span>
                    <input
                      type="number"
                      value={newRecord.odometer}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, odometer: Number(e.target.value) }))}
                      required
                      className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs font-mono font-black outline-none dark:text-white"
                    />
                  </div>
                </div>

                {/* Fuel slide bar */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block flex items-center justify-between">
                    <span>مستوى خزان الوقود الحالي</span>
                    <span className="text-[9.5px] text-brand-blue-500 font-mono">{newRecord.fuelLevel}%</span>
                  </label>
                  <div className="flex items-center gap-3 py-1 bg-slate-50 dark:bg-slate-950 px-3.5 rounded-2xl border border-slate-100 dark:border-slate-850 h-[38px]">
                    <Droplet size={13} className="text-brand-blue-500 shrink-0" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={newRecord.fuelLevel}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, fuelLevel: Number(e.target.value) }))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DIAGNOSTIC INSPECTION CHECKLIST (Modern elegant matrix) */}
              <div className="space-y-3 pt-3">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-850/60 pb-1.5">
                  <ClipboardCheck size={15} className="text-brand-blue-600 dark:text-brand-blue-400" />
                  <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white">جدول التحقق الفني الفحصي لسلامة الأنظمة</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {[
                    { key: 'engineHydraulics', label: 'المحرك وصمامات هيدروليك الرفع' },
                    { key: 'brakesBattery', label: 'الفرامل وسوائل الدائرة والبطارية' },
                    { key: 'bodyPaint', label: 'المظهر الخارجي ودهان الهيكل' },
                    { key: 'tiresAxles', label: 'سلامة ونقش ومحاور عجلات الآلية' },
                    { key: 'lightsIndicators', label: 'الأنوار الرئيسية والجانبية' },
                    { key: 'safetyEquipment: ok', keyOriginal: 'safetyEquipment', label: 'حقيبة وجنازير السلامة والطوارئ' },
                    { key: 'cleanliness', label: 'نظافة الكبينة والكونسول الداخلي' },
                  ].map((field) => {
                    const k = (field.keyOriginal || field.key) as keyof HandoverRecord['checklist'];
                    const currentVal = newRecord.checklist[k];

                    return (
                      <div 
                        key={field.key}
                        className="p-3 bg-slate-50/70 dark:bg-slate-955/65 rounded-2xl border border-slate-100 dark:border-slate-850/40 flex flex-col justify-between space-y-2 text-right"
                      >
                        <span className="text-[11px] font-black text-slate-800 dark:text-slate-300 leading-normal">{field.label}</span>
                        
                        <div className="grid grid-cols-3 gap-1 pt-1">
                          {[
                            { value: 'ok', label: 'سليم', color: 'peer-checked:bg-emerald-500 hover:text-emerald-500 peer-checked:text-white border-emerald-500/10' },
                            { value: 'fail', label: 'خلل', color: 'peer-checked:bg-rose-500 hover:text-rose-500 peer-checked:text-white border-rose-500/10' },
                            { value: 'na', label: 'N/A', color: 'peer-checked:bg-slate-500 hover:text-slate-500 peer-checked:text-white border-slate-500/10' },
                          ].map((opt) => (
                            <label key={opt.value} className="relative cursor-pointer select-none">
                              <input
                                type="radio"
                                name={`check-${k}`}
                                checked={currentVal === opt.value}
                                onChange={() => {
                                  setNewRecord(prev => ({
                                    ...prev,
                                    checklist: {
                                      ...prev.checklist,
                                      [k]: opt.value
                                    }
                                  }));
                                }}
                                className="sr-only peer"
                              />
                              <div className={`py-1 rounded-lg border text-[9.5px] font-black text-center transition-all bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 ${opt.color}`}>
                                {opt.label}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: PHOTO UPLOADING & FAULTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-3">
                {/* Damage description notes */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block">تفصيل الأعطال، العيوب أو تزييف الهيكل</label>
                  <textarea
                    rows={4}
                    value={newRecord.damageNotes}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, damageNotes: e.target.value }))}
                    placeholder="فصّل هنا أي عجز، كسر بالهيكل، خدوش في الدهانات، نقص بالأدوات الفنية، أو ملاحظات الإصلاح والقطع..."
                    className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 focus:border-brand-blue-450 rounded-2xl text-xs font-bold' outline-none dark:text-white"
                  />
                </div>

                {/* Photo Drag & Drop visual gallery */}
                <div className="space-y-1.5 text-right font-bold">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-420 block flex items-center justify-between">
                    <span>توثيق الأضرار بالصور الفوتوغرافية</span>
                    <span className="text-[9.5px] text-slate-400 font-bold">ملف صور بصيغة Base64</span>
                  </label>

                  <div 
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-blue-450 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-2.5xl flex flex-col items-center justify-center text-center cursor-pointer min-h-[110px] transition-colors relative"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <Camera size={22} className="text-slate-400 mb-1" />
                    <span className="text-[10.5px] font-black text-slate-700 dark:text-slate-300">اسحب الصور أو انقر لتحديد الملفات</span>
                    <span className="text-[8.5px] text-slate-400 dark:text-slate-500 mt-1">يُسمح برفع عدة مسببات وصور خدوش للهيكل</span>
                  </div>

                  {/* Stock Demo fast simulator button */}
                  <div className="flex items-center gap-1.5 py-1 select-none">
                    <span className="text-[8.5px] text-slate-400 font-black">مسببات تلف محاكاة سريعة للتحميل:</span>
                    {DEMO_DAMAGES.map((demo, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => addDemoDamagePhoto(demo.url)}
                        className="text-[8.5px] font-black bg-slate-100 hover:bg-slate-200 text-slate-650 px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer"
                      >
                        + {demo.title}
                      </button>
                    ))}
                  </div>

                  {/* Drag drop gallery */}
                  {newRecord.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2.5">
                      {newRecord.images.map((photo, index) => (
                        <div key={index} className="relative w-14 h-14 rounded-xl border border-slate-200 overflow-hidden shrink-0 group">
                          <img src={photo} alt="damage-rec" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: LIVE ELECTRONIC SIGNATURE CANVAS BOARD */}
              <div className="bg-slate-50/40 dark:bg-slate-950/20 rounded-2.5xl border border-slate-100 dark:border-slate-850/60 p-4 pt-3.5 space-y-3.5" dir="rtl">
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-850/40 pb-1.5 select-none">
                  <div className="flex items-center gap-2">
                    <PenTool size={14} className="text-brand-blue-600 dark:text-brand-blue-400" />
                    <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white">توقيع السائق والضابط المسؤول إلكترونياً</h3>
                  </div>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[9.5px] font-black text-slate-450 hover:text-rose-500 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 px-2 py-0.5 rounded-lg cursor-pointer"
                  >
                    مسح التوقيع وإعادة المحاولة
                  </button>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-4 justify-between">
                  <div className="flex-1 space-y-2 text-right">
                    <div className="bg-brand-blue-500/5 p-3 rounded-2xl border border-brand-blue-500/10 text-[10.5px] leading-relaxed font-bold text-slate-700 dark:text-slate-350">
                      📝 <span className="text-slate-900 dark:text-white font-extrabold font-sans">تعهد ومصادقة قانونية:</span> 
                      يرجى رسم التوقيع باليد أو الفأرة في المساحة المحاطة بجانب اليسار. بالتوقيع الإلكتروني يُقر السائق بفحصه الكامل للآلية والتعهد التام بحفظ جودتها وتحمل المسؤولية الجنائية والمدنية الناتجة عن أي تفريط أو استخدام مغلوط.
                    </div>
                    {newRecord.signatureData && (
                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-extrabold animate-pulse">
                        <Check size={11} />
                        <span>تم التقاط التشفير الإلكتروني للتوقيع بنجاح!</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-80 shrink-0 select-none">
                    <canvas
                      ref={signatureCanvasRef}
                      width={320}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="border border-slate-200 dark:border-slate-800 bg-white rounded-2xl w-full h-[120px] cursor-crosshair shadow-inner block"
                    />
                    <div className="text-[8.5px] text-slate-400 text-center mt-1">مربع التوقيع باللمس أو سحب الفأرة (Pointer Ink Canvas)</div>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-3 justify-end">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('list')}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-black rounded-xl cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 size={13} />
                  <span>اعتماد وختم المحضر المؤرشف</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAIL DRAWER / POPUP FOR ARCHIVED HANDOVERS */}
      {selectedRecord && (
        <div 
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs select-none"
          onClick={() => setSelectedRecord(null)}
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-[#0f1422] rounded-[2rem] border border-slate-105 dark:border-slate-805/80 max-w-2xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Stamp simulation banner */}
            <div className="absolute top-12 left-12 border-4 border-emerald-500/30 text-emerald-600/35 rounded-full w-24 h-24 font-black flex items-center justify-center text-[10.5px] uppercase tracking-wider transform -rotate-15 pointer-events-none select-none font-sans">
              ميكانيك 360 معتمد
            </div>

            {/* Header popup info */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="text-right">
                <span className="text-[9px] font-mono tracking-wider text-brand-blue-600 font-extrabold">{selectedRecord.orderNumber}</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-1">محضر تسليم واستلام رسمي موثق</h3>
                <span className="text-[9.5px] text-slate-450 block">{selectedRecord.date}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintDocument(selectedRecord)}
                  className="p-1 px-2.5 bg-brand-blue-50 hover:bg-brand-blue-100 text-brand-blue-600 text-[10.5px] font-black rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title="تحميل وطباعة وثيقة PDF"
                >
                  <Printer size={13} />
                  <span>طباعة رسمية</span>
                </button>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-5 text-right no-scrollbar">
              {/* Top Banner Alert */}
              <div className="bg-brand-blue-500/5 dark:bg-brand-blue-500/10 p-3 rounded-2xl border border-brand-blue-500/10 text-xs text-brand-blue-650 dark:text-brand-blue-400 font-black flex items-center gap-2 shadow-xs">
                <Sparkles size={14} />
                <span>
                  {selectedRecord.type === 'outgoing' 
                    ? 'محضر رسمي بنقل المسؤولية القانونية وتأكيد سلامة الآلية بعهدة وحيازة السائق' 
                    : 'محضر تبرئة المسؤولية وإعادتها لملاك المجموعة الفنية وقسم صيانة الأساطيل'
                  }
                </span>
              </div>

              {/* Grid 1: Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-955/60 p-4 rounded-2.5xl border border-slate-100/50 dark:border-slate-850/40">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 block font-bold">المركبة / للآلية الميكانيكية:</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRecord.vehicleName}</span>
                    <span className="block text-[10.5px] font-mono text-slate-500">{selectedRecord.vehiclePlate}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 block font-bold">قراءة العداد الحالية:</span>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-300 font-mono">{selectedRecord.odometer.toLocaleString()} كم</span>
                  </div>
                </div>

                <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-955/60 p-4 rounded-2.5xl border border-slate-100/50 dark:border-slate-850/40">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 block font-bold">السائق المفوض بالعهدة:</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">{selectedRecord.driverName}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-450 block font-bold">نوع ومرحلة الصيانة:</span>
                    <span className="text-xs font-black text-slate-750 dark:text-slate-400 leading-none">{maintTypeLabels[selectedRecord.maintenanceStatus]}</span>
                  </div>
                </div>
              </div>

              {/* Checklist details matrix */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 block">تفاصيل المسح الفني للأنظمة المطابقة:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-bold font-sans">
                  {[
                    { key: 'engineHydraulics', label: 'سلامة المحرك وهيدروليك تدفق الضغط' },
                    { key: 'brakesBattery', label: 'الفرامل وضغط السوائل وأداء البطارية' },
                    { key: 'bodyPaint', label: 'الهيكل الخارجي والدهانات والخدوش' },
                    { key: 'tiresAxles', label: 'نقوش وضغط الإطارات والمحاور الفنية' },
                    { key: 'lightsIndicators', label: 'الأنوار الرئيسية وشبكة الإشارات' },
                    { key: 'cleanliness', label: 'كبينة القيادة والمقاعد والكونسول' },
                  ].map((chk) => {
                    const statusVal = selectedRecord.checklist[chk.key as keyof HandoverRecord['checklist']];
                    let statusLabel = 'سليم وصالح';
                    let statusColorClass = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                    if (statusVal === 'fail') {
                      statusLabel = 'يوجد عطل / كسر';
                      statusColorClass = 'bg-rose-500/10 text-rose-600 dark:text-rose-455';
                    } else if (statusVal === 'na') {
                      statusLabel = 'لا ينطبق';
                      statusColorClass = 'bg-slate-500/10 text-slate-500';
                    }

                    return (
                      <div 
                        key={chk.key}
                        className="p-2 px-3 bg-slate-50/20 dark:bg-slate-950/20 rounded-xl border border-slate-100/70 dark:border-slate-850/40 flex items-center justify-between"
                      >
                        <span className="text-slate-705 dark:text-slate-400 font-bold">{chk.label}</span>
                        <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${statusColorClass}`}>{statusLabel}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Damage Notes display wrapper */}
              <div className="space-y-2">
                <span className="text-[11px] font-black text-slate-500 block">تفصيل التلفيات والعيوب المخططة المرصودة:</span>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-855 text-xs font-bold leading-relaxed text-slate-800 dark:text-slate-300">
                  {selectedRecord.damageNotes || 'سليمة كلياً، لم يتم رصد أي خلل بالهيكل أو الأنظمة الميكانيكية المذكورة طيلة تشغيلها.'}
                </div>
              </div>

              {/* Photo uploader view if uploaded */}
              {selectedRecord.images && selectedRecord.images.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-slate-500 block">الأدلة الفوتوغرافية وصور التلفيات:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.images.map((imgUrl, index) => (
                      <a href={imgUrl} target="_blank" rel="noreferrer" key={index} className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden shrink-0 hover:scale-[1.03] transition-transform shadow-xs">
                        <img src={imgUrl} alt="damage-f" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Signature capture section */}
              <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col md:flex-row items-stretch justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">الضابط الفحصي المسؤول:</span>
                  <span className="text-xs font-black text-slate-900 dark:text-white">{selectedRecord.employeeName}</span>
                  <span className="block text-[9.5px] text-brand-blue-500 font-extrabold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={10} />
                    <span>توقيع ومصادقة إلكترونية مدمجة</span>
                  </span>
                </div>

                <div className="w-48 bg-slate-50 dark:bg-slate-950 rounded-xl p-2 border border-slate-100 dark:border-slate-850 flex flex-col items-center justify-center">
                  <span className="text-[9px] text-slate-400 font-bold block mb-1">توقيع السائق الحركي المستأمن:</span>
                  {selectedRecord.signatureData && selectedRecord.signatureData !== 'mock' ? (
                    <img src={selectedRecord.signatureData} alt="signature" className="max-h-12 object-contain" />
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-500 font-black tracking-widest">[تم التثبيت بالبصمة]</span>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
