import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  Search, 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Layers, 
  DollarSign, 
  Tag, 
  Package, 
  MapPin, 
  Users, 
  History, 
  Check, 
  Minus, 
  ArrowRightLeft, 
  FileText, 
  Edit3, 
  Trash2, 
  Bell,
  Box,
  Truck,
  RotateCcw,
  Printer,
  Sparkles,
  ClipboardCheck,
  X,
  Grid,
  List,
  Image as ImageIcon,
  Calendar,
  Layers3,
  Activity,
  Info,
  Camera,
  Upload
} from 'lucide-react';
import { InventoryItem, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';

const SYSTEM_ANCHOR_DATE = '2026-05-19';

// Code 39 Lookup Map for Vector Barcode Generator
const CODE39_ALPHABET: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000',
  '4': '000110001', '5': '100110000', '6': '001110000', '7': '000100101',
  '8': '100100100', '9': '001100100', 'A': '100001001', 'B': '001001001',
  'C': '101001000', 'D': '000011001', 'E': '100011000', 'F': '001011000',
  'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011',
  'O': '100010010', 'P': '001010010', 'Q': '000000111', 'R': '100000110',
  'S': '001000110', 'T': '000010110', 'U': '110000001', 'V': '011000001',
  'W': '111000000', 'X': '010010001', 'Y': '110010000', 'Z': '011010000',
  '-': '010000101', '.': '110000000', ' ': '011000100', '*': '010010100',
  '$': '010101000', '/': '010100010', '+': '010001010', '%': '000101010'
};

interface BarcodeProps {
  val: string;
  height?: number;
  showText?: boolean;
}

export function Barcode({ val, height = 40, showText = true }: BarcodeProps) {
  const norm = (val || 'PART').toUpperCase().replace(/[^A-Z0-9\-\.\ \$\/\+\%]/g, '-');
  const fullVal = `*${norm}*`; // Start and stop characters

  const elements: { type: 'bar' | 'space'; width: number }[] = [];

  for (let i = 0; i < fullVal.length; i++) {
    const char = fullVal[i];
    const bits = CODE39_ALPHABET[char] || CODE39_ALPHABET['-'];
    
    for (let bitIdx = 0; bitIdx < 9; bitIdx++) {
      const bit = bits[bitIdx];
      const width = bit === '1' ? 3 : 1;
      const type = bitIdx % 2 === 0 ? 'bar' : 'space';
      elements.push({ type, width });
    }
    // Inter-character narrow space
    if (i < fullVal.length - 1) {
      elements.push({ type: 'space', width: 1 });
    }
  }

  // Count total width
  let totalWidth = 0;
  elements.forEach(el => {
    totalWidth += el.width;
  });

  let currentX = 0;
  return (
    <div className="flex flex-col items-center justify-center select-none bg-white p-1 rounded">
      <svg 
        viewBox={`0 0 ${totalWidth} ${height}`} 
        className="w-full"
        style={{ height: `${height}px` }}
        preserveAspectRatio="none"
      >
        {elements.map((el, idx) => {
          const x = currentX;
          currentX += el.width;
          if (el.type === 'bar') {
            return (
              <rect 
                key={idx} 
                x={x} 
                y={0} 
                width={el.width} 
                height={height} 
                fill="black" 
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className="text-[10px] sm:text-xs font-mono tracking-widest text-slate-800 mt-1 font-bold">
          {norm}
        </span>
      )}
    </div>
  );
}

// High-quality Auto Spare Parts Category image presets from Unsplash
const PART_CATEGORY_PRESETS: Record<string, string> = {
  'فلاتر': 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80', // Engine / Spark / Spark Plug
  'فرامل': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80', // Wheels / Brembo brake disc details
  'إطارات': 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=400&q=80', // Tire thread close-up
  'أقراص وزيوت': 'https://images.unsplash.com/photo-1607526972239-0bd45bc79c8c?auto=format&fit=crop&w=400&q=80', // Golden oil drops / industrial fluid
  'هيدروليك': 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80', // Factory dials / technical hydraulic layout
  'كهرباء': 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=400&q=80', // Electrical fuses and circuits
  'أخرى': 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80' // Standard engine block / bolts assembly
};

export function getPartImage(item: InventoryItem): string {
  if (item.image) return item.image;
  return PART_CATEGORY_PRESETS[item.category] || PART_CATEGORY_PRESETS['أخرى'];
}

// Default enriched inventory items
const initialInventoryItems: InventoryItem[] = [
  {
    id: 'i1',
    name: 'فلتر زيت تويوتا هايلوكس الأصلي',
    partNumber: 'TOY-1234-F',
    quantity: 45,
    minQuantity: 10,
    category: 'فلاتر',
    price: 65,
    shelfLocation: 'أ-3 / رف 2',
    compatibleVehicles: ['تويوتا هايلوكس بيك أب', 'تويوتا لاندكروزر'],
    supplier: 'الشركة العربية المحدودة لقطع الغيار',
    brand: 'تويوتا جينوين (Toyota Genuine)',
    sku: 'SKU-775-FLT-TOY',
    condition: 'new',
    boxQuantity: 12,
    weight: '0.4 كجم',
    lastOrderedDate: '2026-05-10',
    managerNotes: 'معدل استهلاك متسرع بسبب الصيانة الصيفية لمركبات التوزيع الخفيف.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i2',
    name: 'وسادات فرامل أمامية أكتروس',
    partNumber: 'MB-5678-B',
    quantity: 5,
    minQuantity: 8,
    category: 'فرامل',
    price: 450,
    shelfLocation: 'ب-1 / رف 4',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس MP4'],
    supplier: 'مجموعة النبهان المعتمدة لمرسيدس',
    brand: 'مرسيدس بنز غينوين (OEM)',
    sku: 'SKU-880-BRK-MB',
    condition: 'new',
    boxQuantity: 4,
    weight: '3.2 كجم',
    lastOrderedDate: '2026-05-01',
    managerNotes: 'حساس جودة لفرامل المقطورات الثقيلة. يجب الفحص الجيد للمقاييس قبل فك التعبئة.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i3',
    name: 'إطار شاحنة ميشلان 22.5',
    partNumber: 'TIR-0099-M',
    quantity: 12,
    minQuantity: 4,
    category: 'إطارات',
    price: 1850,
    shelfLocation: 'الساحة ج / حائط 1',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس', 'مان شاحنات ثقيلة'],
    supplier: 'إطارات العالمية الموزع المعتمد',
    brand: 'ميشلان الوعب (Michelin)',
    sku: 'SKU-109-TIR-MIC',
    condition: 'new',
    boxQuantity: 2,
    weight: '45.0 كجم',
    lastOrderedDate: '2026-04-20',
    managerNotes: 'يُحفظ تحت مظلة الساحة الخارجية رقم 3 المحمية من ضربات الأشعة الشمسية المباشرة.',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i4',
    name: 'زيت فرامل شاحنات بريميوم',
    partNumber: 'BRK-OIL-55',
    quantity: 30,
    minQuantity: 15,
    category: 'أقراص وزيوت',
    price: 35,
    shelfLocation: 'أ-1 / رف 5',
    compatibleVehicles: ['تويوتا بيك أب - هايلوكس', 'رافعة شوكية كاتربيلر'],
    supplier: 'الزيوت الوطنية والسوائل الصناعية',
    brand: 'لوبكس المحلي (Lubrex)',
    sku: 'SKU-441-OIL-LUB',
    condition: 'new',
    boxQuantity: 24,
    weight: '1.0 كجم',
    lastOrderedDate: '2026-05-15',
    managerNotes: 'مقاوم عالي للحرارة وصالح للرافعات الشوكية الثقيلة بموجب التوريد المعتمد.',
    image: 'https://images.unsplash.com/photo-1607526972239-0bd45bc79c8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i5',
    name: 'حلقة وعازل تسرب هيدروليكي',
    partNumber: 'HYD-SEAL-88',
    quantity: 9,
    minQuantity: 10,
    category: 'هيدروليك',
    price: 75,
    shelfLocation: 'ج-2 / رف 1',
    compatibleVehicles: ['رافعة شوكية كاتربيلر'],
    supplier: 'مؤسسة هيدرولك العرب للتصنيع',
    brand: 'كاتربيلر بريميوم (Caterpillar)',
    sku: 'SKU-990-HYD-CAT',
    condition: 'new',
    boxQuantity: 100,
    weight: '0.05 كجم',
    lastOrderedDate: '2026-05-12',
    managerNotes: 'أجزاء جيلاتينية مجهرية دقيقة وحساسة للرطوبة، يوصى بحفظها بالعلب الأصلية المحكمة.',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i6',
    name: 'شمعات احتراق وتوصيل (بواجي)',
    partNumber: 'PLUG-NGK-21',
    quantity: 60,
    minQuantity: 20,
    category: 'كهرباء',
    price: 25,
    shelfLocation: 'ب-5 / رف 3',
    compatibleVehicles: ['تويوتا بيك أب - هايلوكس'],
    supplier: 'الشركة العربية المحدودة لقطع الغيار',
    brand: 'إن جي كي ياباني (NGK Japan)',
    sku: 'SKU-202-ELE-NGK',
    condition: 'new',
    boxQuantity: 50,
    weight: '0.12 كجم',
    lastOrderedDate: '2026-05-18',
    managerNotes: 'توصيل كهربائي مخصص لسيارات البنزين 4 سلندر حصراً.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i7',
    name: 'فلتر هواء محرك شاحنات فولفو',
    partNumber: 'VOL-9921-A',
    quantity: 18,
    minQuantity: 6,
    category: 'فلاتر',
    price: 320,
    shelfLocation: 'أ-4 / رف 1',
    compatibleVehicles: ['شاحنة فولفو FH4', 'شاحنة فولفو FM'],
    supplier: 'مجموعة المجد للتوريدات اللوجستية',
    brand: 'فولفو غينوين (Volvo Genuine)',
    sku: 'SKU-554-FLT-VOL',
    condition: 'new',
    boxQuantity: 6,
    weight: '1.8 كجم',
    lastOrderedDate: '2026-04-12',
    managerNotes: 'يجب تنظيفه بضغط هواء منخفض عند الفحص الدوري وتغييره بشكل كلي كل 30,000 كم لتجنب خنق المحرك.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i8',
    name: 'مضخة هيدروليكية بوش ريكسروث',
    partNumber: 'BOS-REX-30',
    quantity: 3,
    minQuantity: 2,
    category: 'هيدروليك',
    price: 3450,
    shelfLocation: 'ج-1 / رف الثني',
    compatibleVehicles: ['رافعة شوكية كاتربيلر', 'معدة هيدروليكية ثقيلة'],
    supplier: 'الشركة السعودية لتقنيات الهيدروليك',
    brand: 'بوش ريكسروث (Bosch Rexroth)',
    sku: 'SKU-112-HYD-BOS',
    condition: 'new',
    boxQuantity: 1,
    weight: '18.5 كجم',
    lastOrderedDate: '2026-03-24',
    managerNotes: 'مضخة تزامنية عالية الضغط. قطعة استراتيجية ومكلفة، تفحص عند الدخول للمستودعات.',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i9',
    name: 'زيت محرك ديزل شل ريمولا R4',
    partNumber: 'SHELL-R4-15W',
    quantity: 80,
    minQuantity: 20,
    category: 'أقراص وزيوت',
    price: 180,
    shelfLocation: 'مستودع السوائل / رف 1',
    compatibleVehicles: ['جميع شاحنات الديزل أكتروس وفولفو', 'بيك أب ايسوزو ديماكس'],
    supplier: 'شل السعودية للمشتقات النفطية',
    brand: 'شل ريمولا (Shell Rimula)',
    sku: 'SKU-303-OIL-SHL',
    condition: 'new',
    boxQuantity: 4,
    weight: '17.2 كجم',
    lastOrderedDate: '2026-05-20',
    managerNotes: 'زيت 15W-40 ممتاز وحماية فائقة للديزل الشاق تحت درجات الحرارة المرتفعة.',
    image: 'https://images.unsplash.com/photo-1607526972239-0bd45bc79c8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i10',
    name: 'دينامو كهربائي دينسو 24 فولت',
    partNumber: 'DEN-ALT-24V',
    quantity: 7,
    minQuantity: 3,
    category: 'كهرباء',
    price: 1250,
    shelfLocation: 'ب-3 / رف 1',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس', 'مان شاحنات ثقيلة'],
    supplier: 'الشركة العربية المحدودة لقطع الغيار',
    brand: 'دينسو ياباني (Denso Japan)',
    sku: 'SKU-411-ELE-DEN',
    condition: 'new',
    boxQuantity: 2,
    weight: '8.4 كجم',
    lastOrderedDate: '2026-04-18',
    managerNotes: 'كهربائي 24 فولت أمبيرية عالية لشحن حزم البطاريات المزدوجة في شاحنات التوزيع الطويل.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i11',
    name: 'مصباح أمامي إل إي دي أكتروس',
    partNumber: 'MB-LED-HL9',
    quantity: 4,
    minQuantity: 4,
    category: 'أخرى',
    price: 2400,
    shelfLocation: 'ج-4 / رف 2',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس MP4'],
    supplier: 'مجموعة النبهان المعتمدة لمرسيدس',
    brand: 'مرسيدس بنز جينوين (OEM)',
    sku: 'SKU-909-LGT-MBZ',
    condition: 'new',
    boxQuantity: 2,
    weight: '5.6 كجم',
    lastOrderedDate: '2026-05-02',
    managerNotes: 'مصباح أمامي ذكي مع عدسات تكيفية. حساس للكسر والصدمات، يحفظ في غلاف الماني محكم بالكامل.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i12',
    name: 'فلتر وقود ديزل كومينز',
    partNumber: 'CUM-FLEET-90',
    quantity: 35,
    minQuantity: 12,
    category: 'فلاتر',
    price: 145,
    shelfLocation: 'أ-2 / رف 4',
    compatibleVehicles: ['مولدات ديزل Cummins', 'شاحنات فوتون ديزل'],
    supplier: 'شركة الفلترة المتحدة والمعدات',
    brand: 'فليت جارد (Fleetguard)',
    sku: 'SKU-112-FLT-CUM',
    condition: 'new',
    boxQuantity: 12,
    weight: '0.8 كجم',
    lastOrderedDate: '2026-05-22',
    managerNotes: 'فلتر عالي النقاء لفصل جزيئات الماء من وقود الديزل رديء الكفاءة، يحافظ على بخاخات الضغط العالي.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i13',
    name: 'سائل تبريد رادياتير بريستون أحمر',
    partNumber: 'PRES-COOL-RED',
    quantity: 110,
    minQuantity: 30,
    category: 'أقراص وزيوت',
    price: 45,
    shelfLocation: 'مستودع السوائل / رف 3',
    compatibleVehicles: ['جميع مركبات الأسطول الخفيف والثقيل'],
    supplier: 'الموزعون المتضامنون للمواد البترولية',
    brand: 'بريستون أمريكي (Prestone)',
    sku: 'SKU-772-OIL-PRS',
    condition: 'new',
    boxQuantity: 6,
    weight: '4.2 كجم',
    lastOrderedDate: '2026-05-28',
    managerNotes: 'تركيز 50/50 مطور يدوم لـ 5 سنوات أو 250 ألف كم لحماية الألمنيوم ومكونات الرادياتير من التآكل.',
    image: 'https://images.unsplash.com/photo-1607526972239-0bd45bc79c8c?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i14',
    name: 'طقم ديسك وصحن كلتش ساكس',
    partNumber: 'SACHS-FH4-CLU',
    quantity: 4,
    minQuantity: 2,
    category: 'أخرى',
    price: 3200,
    shelfLocation: 'ج-3 / رف 3',
    compatibleVehicles: ['شاحنة فولفو FH4', 'شاحنة فولفو FM'],
    supplier: 'الشركة العربية المحدودة لقطع الغيار',
    brand: 'ساكس ألماني (Sachs Germany)',
    sku: 'SKU-894-CLU-SAC',
    condition: 'new',
    boxQuantity: 1,
    weight: '32.0 كجم',
    lastOrderedDate: '2026-03-12',
    managerNotes: 'حزمة كاملة تتضمن ديسك وصحن وفحمة كلتش مخصصة لحالات الاستبدال الإجمالي الشاق للناقل غير التلقائي.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i15',
    name: 'أقراص فرامل بريمبو ثقيلة',
    partNumber: 'BREM-ROTOR-X',
    quantity: 16,
    minQuantity: 6,
    category: 'فرامل',
    price: 680,
    shelfLocation: 'ب-1 / رف 2',
    compatibleVehicles: ['تويوتا لاندكروزر', 'تويوتا بيك أب - هايلوكس'],
    supplier: 'الشركة العالمية للتجهيزات الفنية',
    brand: 'بريمبو الأصلي (Brembo)',
    sku: 'SKU-660-BRK-BRM',
    condition: 'new',
    boxQuantity: 2,
    weight: '12.0 كجم',
    lastOrderedDate: '2026-05-08',
    managerNotes: 'أقراص مهواة ومقاومة كليا للحماوة والاعوجاج المفاجئ في الطرق الجبلية الوعرة والمنحدرات.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i16',
    name: 'شفرات مساحات زجاج بوش إيروتوين',
    partNumber: 'BOS-AERO-28',
    quantity: 25,
    minQuantity: 10,
    category: 'أخرى',
    price: 90,
    shelfLocation: 'ب-5 / رف 1',
    compatibleVehicles: ['شاحنات مرسيدس وفولفو وباصات هيونداي'],
    supplier: 'مجموعة المجد للتوريدات اللوجستية',
    brand: 'بوش بريميوم (Bosch)',
    sku: 'SKU-312-WIP-BOS',
    condition: 'new',
    boxQuantity: 10,
    weight: '0.3 كجم',
    lastOrderedDate: '2026-05-19',
    managerNotes: 'طول 28 بوصة، شفرات مطاطية مغلفة بالغرافيت لمقاومة درجات الحرارة المحلية العالية وتراكم الرمال الساحلية.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i17',
    name: 'قشاط بكرة محرك غيتس ثنائي',
    partNumber: 'GATES-BELT-8X',
    quantity: 14,
    minQuantity: 5,
    category: 'أخرى',
    price: 110,
    shelfLocation: 'أ-5 / رف 4',
    compatibleVehicles: ['تويوتا بيك أب - هايلوكس', 'ايسوزو ديماكس'],
    supplier: 'الزيوت الوطنية والسوائل الصناعية',
    brand: 'غيتس الأمريكي (Gates USA)',
    sku: 'SKU-882-BLT-GAT',
    condition: 'new',
    boxQuantity: 20,
    weight: '0.25 كجم',
    lastOrderedDate: '2026-04-14',
    managerNotes: 'سيور ناقلة عريضة لتقليل الضوضاء ومنع التزحلق تحت درجات الحرارة فوق 50 درجة مئوية.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i18',
    name: 'سلف تشغيل ديلكو ريمي 24 فولت',
    partNumber: 'DEL-STR-24V',
    quantity: 2,
    minQuantity: 3,
    category: 'كهرباء',
    price: 1650,
    shelfLocation: 'ب-3 / رف 4',
    compatibleVehicles: ['شاحنة كينورث', 'شاحنة مرسيدس أكتروس'],
    supplier: 'الشركة العالمية للتجهيزات الفنية',
    brand: 'ديلكو ريمي (Delco Remy)',
    sku: 'SKU-505-POT-DEL',
    condition: 'new',
    boxQuantity: 1,
    weight: '11.2 كجم',
    lastOrderedDate: '2026-05-04',
    managerNotes: 'محرك بدء حركة بقوة عزم ميكانيكية استثنائية للمحركات العملاقة ذات السعة الأعلى من 12 لتر ديزل.',
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i19',
    name: 'مساعد مونرو ماجنوم أمامي شاحنات',
    partNumber: 'MON-MAG-102',
    quantity: 8,
    minQuantity: 4,
    category: 'أخرى',
    price: 750,
    shelfLocation: 'ج-2 / رف 4',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس', 'مان شاحنات ثقيلة'],
    supplier: 'الموزعون المتضامنون للمواد البترولية',
    brand: 'مونرو (Monroe)',
    sku: 'SKU-199-SHK-MON',
    condition: 'new',
    boxQuantity: 2,
    weight: '6.7 كجم',
    lastOrderedDate: '2026-05-11',
    managerNotes: 'نظام امتصاص صدمات هيدروليكي مزدوج يعزز استقرار المقطورات المحملة بالمواد السائلة والخطرة.',
    image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'i20',
    name: 'منفاخ تعليق هوائي فايرستون',
    partNumber: 'FIRE-AIR-990',
    quantity: 6,
    minQuantity: 4,
    category: 'هيدروليك',
    price: 980,
    shelfLocation: 'ج-1 / رف 3',
    compatibleVehicles: ['شاحنة مرسيدس أكتروس MP4', 'مقطورات تعليق هوائي'],
    supplier: 'الشركة السعودية لتقنيات الهيدروليك',
    brand: 'فايرستون (Firestone)',
    sku: 'SKU-492-AIR-FRS',
    condition: 'new',
    boxQuantity: 2,
    weight: '14.0 كجم',
    lastOrderedDate: '2026-05-25',
    managerNotes: 'منفاخ بالون هوائي للمحاور الخلفية. يضمن راحة القيادة والتوزيع المتكافئ للمقاييس الوزنية بالمحاور.',
    image: 'https://images.unsplash.com/photo-1508974239320-0a029497e820?auto=format&fit=crop&w=400&q=80'
  }
];

// Transaction log item structure for audits
interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  partNumber: string;
  type: 'incoming' | 'outgoing' | 'adjust';
  quantityDelta: number;
  reason: string;
  operator: string;
  date: string;
}

const initialTransactions: InventoryTransaction[] = [
  {
    id: 't1',
    itemId: 'i1',
    itemName: 'فلتر زيت تويوتا الأصلي',
    partNumber: 'TOY-1234-F',
    type: 'incoming',
    quantityDelta: 20,
    reason: 'توريد دفعة جديدة من الوكيل',
    operator: 'المهندس خالد',
    date: '2026-05-15'
  },
  {
    id: 't2',
    itemId: 'i2',
    itemName: 'وسادات فرامل أمامية أكتروس',
    partNumber: 'MB-5678-B',
    type: 'outgoing',
    quantityDelta: 2,
    reason: 'صرف لأمر الصيانة WO-2024-001',
    operator: 'الفني أحمد',
    date: '2026-05-18'
  },
  {
    id: 't3',
    itemId: 'i5',
    itemName: 'حلقة وعازل تسرب هيدروليكي',
    partNumber: 'HYD-SEAL-88',
    type: 'adjust',
    quantityDelta: -1,
    reason: 'تسوية الجرد السنوي للمستودع',
    operator: 'المراقب سالم',
    date: '2026-05-19'
  }
];

interface HistoricalAuditRowProps {
  key?: any;
  record: {
    id: string;
    date: string;
    operator: string;
    totalItems: number;
    itemsAdjustedCount: number;
    totalValueAdjusted: number;
    adjustments: {
      itemId: string;
      itemName: string;
      partNumber: string;
      systemQty: number;
      physicalQty: number;
      delta: number;
      price?: number;
      note: string;
    }[];
    generalNotes?: string;
  };
}

function HistoricalAuditRow({ record }: HistoricalAuditRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 space-y-3 hover:bg-slate-50/20 dark:hover:bg-slate-900/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 rounded px-2 py-0.5 font-bold">{record.date}</span>
          <div className="space-y-0.5" dir="rtl">
            <span className="font-black text-slate-800 dark:text-slate-100 block">{record.generalNotes || 'عملية جرد دورية بموجب الفروقات المكتشفة'}</span>
            <span className="text-[10px] text-slate-400 block font-medium mt-0.5">بواسطة المتفقد: {record.operator} • شمل الجرد كلياً {record.totalItems} صنفاً</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left font-mono">
            <span className="text-[10px] text-slate-400 block">فروقات الجرد:</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block">{record.itemsAdjustedCount} أصناف متباينة</span>
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] text-slate-400 block">خسائر/فوائد مالية للعد الفردي:</span>
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">{record.totalValueAdjusted.toLocaleString()} ر.س</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-black cursor-pointer transition-colors"
          >
            {isOpen ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mt-2">
              <span className="text-[10px] font-black text-slate-400 block">تفصيل الفروقات والتسويات الدقيقة التي تم ترحيلها:</span>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[11px] font-bold">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-100/10 dark:border-slate-800 h-7 text-[10px]">
                      <th className="pb-1">اسم الصنف بالكامل</th>
                      <th className="pb-1 text-center">الكمية الدفترية</th>
                      <th className="pb-1 text-center">الكمية الفعلية</th>
                      <th className="pb-1 text-center font-bold">الفارق الفعلي</th>
                      <th className="pb-1 text-right">ملاحظة التدقيق الرفية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.adjustments.map((adj, i) => (
                      <tr key={i} className="border-b last:border-none border-slate-100/30 dark:border-slate-800 py-1 h-8">
                        <td className="text-slate-700 dark:text-slate-300 font-bold">{adj.itemName} <span className="text-[9px] text-slate-400 font-mono">({adj.partNumber})</span></td>
                        <td className="text-center text-slate-400 font-mono font-bold">{adj.systemQty} unit</td>
                        <td className="text-center text-slate-800 dark:text-slate-105 font-mono font-bold">{adj.physicalQty} unit</td>
                        <td className="text-center font-mono">
                          {adj.delta > 0 ? (
                            <span className="text-emerald-500 font-bold">+{adj.delta} زيادة</span>
                          ) : (
                            <span className="text-rose-500 font-bold">{adj.delta} عجز</span>
                          )}
                        </td>
                        <td className="text-slate-500 dark:text-slate-405 text-[10px] pb-0.5">{adj.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface InventoryProps {
  user: User;
}

export default function Inventory({ user }: InventoryProps) {
  const { language } = useLanguage();
  // Inventory state
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const uniqueItems: InventoryItem[] = [];
          const seenIds = new Set<string>();
          for (const item of parsed) {
            if (item && item.id && !seenIds.has(item.id)) {
              seenIds.add(item.id);
              uniqueItems.push(item);
            }
          }
          return uniqueItems;
        }
        return parsed;
      } catch (e) { }
    }
    return initialInventoryItems;
  });

  // Transactions state
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => {
    const saved = localStorage.getItem('fleet_inventory_tx_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { }
    }
    return initialTransactions;
  });

  // Persist inventory state
  useEffect(() => {
    localStorage.setItem('fleet_inventory_v2', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('fleet_inventory_tx_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.tab === 'inventory') {
        if (customEvent.detail.filter === 'toyota') {
          setSearchTerm('تويوتا');
          setStockStatusFilter('low');
        }
      }
    };
    window.addEventListener('notification-navigate', handleNavigate);
    return () => window.removeEventListener('notification-navigate', handleNavigate);
  }, []);

  // Filters & layout state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'healthy'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('fleet_inventory_view_mode') as 'grid' | 'list') || 'grid';
  });

  useEffect(() => {
    localStorage.setItem('fleet_inventory_view_mode', viewMode);
  }, [viewMode]);
  
  // Modals & Panels
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItemForEdit, setSelectedItemForEdit] = useState<InventoryItem | null>(null);
  const [editItemState, setEditItemState] = useState<Partial<InventoryItem>>({});

  // Barcode Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerResult, setScannerResult] = useState<InventoryItem | null>(null);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scannerTxType, setScannerTxType] = useState<'incoming' | 'outgoing'>('outgoing');
  const [scannerTxQty, setScannerTxQty] = useState<string>('1');
  const [scannerTxReason, setScannerTxReason] = useState<string>('');
  const [scannedCodeText, setScannedCodeText] = useState<string>('');
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Control camera stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (isScannerOpen) {
      setScannerResult(null);
      setScannerError(null);
      
      // Attempt camera access with back-facing camera
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          activeStream = s;
          setCameraStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          console.error("Camera access failed", err);
          setScannerError(
            language === 'ar' 
              ? 'فشل الوصول إلى الكاميرا. يرجى مراجعة الصلاحيات في المتصفح أو الضغط على أزرار المحاكاة السريعة بالأسفل للاختبار.' 
              : 'Failed to access camera. Please review browser permissions or use the quick simulation options below.'
          );
        });
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setScannerResult(null);
      setScannerError(null);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isScannerOpen]);

  // Bind video element when stream is active
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream, isScannerOpen]);

  // Decode barcode (Native API if supported, or via manual trigger)
  const handleBarcodeDetected = (scannedCode: string) => {
    if (!scannedCode) return;
    const cleanCode = scannedCode.trim().toUpperCase();
    const found = items.find(item => item.partNumber.toUpperCase() === cleanCode);
    if (found) {
      setScannerResult(found);
      setScannerTxQty('1');
      setScannerTxReason('');
      
      // Play high pleasant beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    } else {
      // Play low warning tone
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(220, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}

      alert(
        language === 'ar'
          ? `عذراً، لم يتم العثور على أي قطعة غيار مسجلة بالكود الشريطي: ${cleanCode}`
          : `Sorry, no registered spare part found with barcode: ${cleanCode}`
      );
    }
  };

  // Submit scanner instant stock change
  const handleScannerTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerResult) return;
    const qty = parseInt(scannerTxQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    const offset = scannerTxType === 'incoming' ? qty : -qty;
    const nextQty = Math.max(0, scannerResult.quantity + offset);
    const delta = nextQty - scannerResult.quantity;

    if (delta !== 0) {
      // Update inventory list
      setItems(prev => prev.map(item => {
        if (item.id === scannerResult.id) {
          return { ...item, quantity: nextQty };
        }
        return item;
      }));

      // Add transaction log
      const newTx: InventoryTransaction = {
        id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        itemId: scannerResult.id,
        itemName: scannerResult.name,
        partNumber: scannerResult.partNumber,
        type: delta > 0 ? 'incoming' : 'outgoing',
        quantityDelta: Math.abs(delta),
        reason: scannerTxReason || (delta > 0 
          ? (language === 'ar' ? 'توريد ممسوح عبر قارئ الباركود اللحظي' : 'Deposit via Barcode Scanner')
          : (language === 'ar' ? 'صرف ممسوح عبر قارئ الباركود اللحظي' : 'Withdrawal via Barcode Scanner')
        ),
        operator: user.name,
        date: SYSTEM_ANCHOR_DATE
      };

      setTransactions(txs => [newTx, ...txs]);
      
      // Update local card state
      setScannerResult(prev => prev ? { ...prev, quantity: nextQty } : null);

      // Reset inputs
      setScannerTxQty('1');
      setScannerTxReason('');

      // Play double success beep
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        osc1.frequency.setValueAtTime(660, audioCtx.currentTime);
        gain1.gain.setValueAtTime(0.05, audioCtx.currentTime);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.08);

        setTimeout(() => {
          try {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
            gain2.gain.setValueAtTime(0.05, audioCtx.currentTime);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.08);
          } catch(e) {}
        }, 100);
      } catch (e) {}
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 4 * 1024 * 1024) {
      alert(language === 'ar' ? 'حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 4 ميجابايت.' : 'Image is too large. Please select a file smaller than 4MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (isEdit) {
        setEditItemState(prev => ({ ...prev, image: base64String }));
      } else {
        setNewItem(prev => ({ ...prev, image: base64String }));
      }
    };
    reader.readAsDataURL(file);
  };
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedItemForTx, setSelectedItemForTx] = useState<InventoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'logs' | 'audit'>('list');

  // Audit Record structures
  interface AuditAdjustment {
    itemId: string;
    itemName: string;
    partNumber: string;
    systemQty: number;
    physicalQty: number;
    delta: number;
    price?: number;
    note: string;
  }

  interface AuditRecord {
    id: string;
    date: string;
    operator: string;
    totalItems: number;
    itemsAdjustedCount: number;
    totalValueAdjusted: number;
    adjustments: AuditAdjustment[];
    generalNotes?: string;
  }

  // Stock Audit states
  const [auditCounts, setAuditCounts] = useState<Record<string, { count: number; note: string }>>({});
  const [auditNotes, setAuditNotes] = useState('');
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem('fleet_audits_history_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('fleet_audits_history_v2', JSON.stringify(auditHistory));
  }, [auditHistory]);

  const handlePostAudit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const adjustments: AuditAdjustment[] = [];
    let itemsAdjustedCount = 0;
    let totalValueAdjusted = 0;

    const updatedItems = items.map(item => {
      const entry = auditCounts[item.id];
      // If user hasn't modified, we assume no discrepancy (physicalQty matches system)
      const physicalQty = entry && entry.count !== undefined ? entry.count : item.quantity;
      const note = entry?.note || '';
      
      const delta = physicalQty - item.quantity;
      
      if (delta !== 0) {
        adjustments.push({
          itemId: item.id,
          itemName: item.name,
          partNumber: item.partNumber,
          systemQty: item.quantity,
          physicalQty,
          delta,
          price: item.price,
          note: note || 'تسوية جرد دورية فنية'
        });
        
        itemsAdjustedCount += 1;
        totalValueAdjusted += Math.abs(delta) * (item.price || 0);
        
        return {
          ...item,
          quantity: physicalQty
        };
      }
      
      return item;
    });

    if (adjustments.length === 0) {
      alert('لا توجد أي فروقات كميات مسجلة لتسويتها حالياً. يرجى تعديل الكميات الفعلية لبعض الأصناف للتجربة.');
      return;
    }

    if (!confirm(`هل أنت متأكد من اعتماد وترحيل فروقات الجرد لعدد (${itemsAdjustedCount}) أصناف وتعديل كميات المستودع الفعليّة فوراً بكود أمن الأستوديو؟`)) {
      return;
    }

    setItems(updatedItems);

    const newTxList: InventoryTransaction[] = adjustments.map(adj => {
      return {
        id: `t-audit-${Date.now()}-${adj.itemId}`,
        itemId: adj.itemId,
        itemName: adj.itemName,
        partNumber: adj.partNumber,
        type: 'adjust',
        quantityDelta: Math.abs(adj.delta),
        reason: `${adj.note || 'مطابقة الجرد الدوري'} (${adj.delta > 0 ? 'فائض زائد' : 'نقص عجز'})`,
        operator: user.name,
        date: SYSTEM_ANCHOR_DATE
      };
    });
    setTransactions(prev => [...newTxList, ...prev]);

    const newAuditSummary: AuditRecord = {
      id: `audit-${Date.now()}`,
      date: SYSTEM_ANCHOR_DATE,
      operator: user.name,
      totalItems: items.length,
      itemsAdjustedCount,
      totalValueAdjusted,
      adjustments,
      generalNotes: auditNotes || 'عملية جرد دورية شاملة لأرفف ومرافق مستودعات المجمع'
    };

    setAuditHistory(prev => [newAuditSummary, ...prev]);
    setAuditCounts({});
    setAuditNotes('');

    alert('تم مطابقة جرد المستودع الدفتري بالفعلي وترحيل فروقات الكميات بنجاح!');
  };

  // Barcode Bulk Printer States
  const [printQueue, setPrintQueue] = useState<{ item: InventoryItem; copies: number }[]>(() => {
    const saved = localStorage.getItem('fleet_barcode_queue');
    return saved ? JSON.parse(saved) : [];
  });
  const [isBulkPrintModalOpen, setIsBulkPrintModalOpen] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'sheet-24' | 'sheet-40' | 'sheet-50' | 'thermal-roll'>('sheet-24');
  const [barcodeScale, setBarcodeScale] = useState<number>(45); // Height in pixels
  const [printColumns, setPrintColumns] = useState<number>(3); // Customizable grid columns
  const [labelBorder, setLabelBorder] = useState<boolean>(true); // Show border labels for cut guidelines
  const [labelSpacer, setLabelSpacer] = useState<number>(10); // Spacing in pixels between labels

  // Persist Print Queue
  useEffect(() => {
    localStorage.setItem('fleet_barcode_queue', JSON.stringify(printQueue));
  }, [printQueue]);

  // Helper to generate a smart barcode for empty parts
  const generateSmartPartNumber = (cat: string) => {
    const catPrefix = {
      'فلاتر': 'FLT',
      'فرامل': 'BRK',
      'إطارات': 'TIR',
      'أقراص وزيوت': 'OIL',
      'هيدروليك': 'HYD',
      'كهرباء': 'ELE',
    }[cat] || 'PRT';
    
    // Generate code format: CAT-YYMMSS-RAND
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const rand = Math.floor(100 + Math.random() * 900); // 3 digit random
    return `${catPrefix}-${yy}${mm}${ss}-${rand}`;
  };

  // Add/Update individual print item in queue
  const addToPrintQueue = (item: InventoryItem, defaultCopies = 1) => {
    setPrintQueue(prev => {
      const existing = prev.find(q => q.item.id === item.id);
      if (existing) {
        return prev.map(q => q.item.id === item.id ? { ...q, copies: q.copies + defaultCopies } : q);
      }
      return [...prev, { item, copies: defaultCopies }];
    });
  };

  // New stock item form state
  const [newItem, setNewItem] = useState({
    name: '',
    partNumber: '',
    quantity: '',
    minQuantity: '',
    category: 'فلاتر',
    price: '',
    shelfLocation: '',
    supplier: '',
    compatibleVehicles: '',
    image: '',
    brand: '',
    sku: '',
    condition: 'new',
    boxQuantity: '',
    weight: '',
    managerNotes: ''
  });

  // Transaction form state
  const [txType, setTxType] = useState<'incoming' | 'outgoing'>('incoming');
  const [txQty, setTxQty] = useState('');
  const [txReason, setTxReason] = useState('');

  // Available unique categories
  const categories = ['all', ...Array.from(new Set(items.map(item => item.category)))];

  // Unique status totals
  const totalItems = items.length;
  const understockItems = items.filter(item => item.quantity <= item.minQuantity);
  const totalStockValue = items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
  const totalQuantitySum = items.reduce((sum, item) => sum + item.quantity, 0);

  // Filter conditions
  const filteredItems = items.filter(item => {
    // 1. Category search
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

    // 2. Stock Health filter
    if (stockStatusFilter === 'low' && item.quantity > item.minQuantity) return false;
    if (stockStatusFilter === 'healthy' && item.quantity <= item.minQuantity) return false;

    // 3. Text query match
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchComp = item.compatibleVehicles?.some(v => v.toLowerCase().includes(q)) || false;
      const matchDirect = item.name.toLowerCase().includes(q) || 
                          item.partNumber.toLowerCase().includes(q) || 
                          (item.shelfLocation && item.shelfLocation.toLowerCase().includes(q)) ||
                          (item.supplier && item.supplier.toLowerCase().includes(q));
      return matchDirect || matchComp;
    }

    return true;
  });

  // Quick Inline Quantity adjustment
  const handleQuickQuantityOffset = (id: string, offset: number, reason: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + offset);
        
        // Push a transaction instantly
        const delta = nextQty - item.quantity;
        if (delta !== 0) {
          const newTx: InventoryTransaction = {
            id: `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            itemId: item.id,
            itemName: item.name,
            partNumber: item.partNumber,
            type: delta > 0 ? 'incoming' : 'outgoing',
            quantityDelta: Math.abs(delta),
            reason: reason || (delta > 0 ? 'إضافة سريعة لمستوى المخزن' : 'سحب سريع لصالح المنصة'),
            operator: user.name,
            date: SYSTEM_ANCHOR_DATE
          };
          setTransactions(txs => [newTx, ...txs]);
        }

        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  // Submit main new item
  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.partNumber || !newItem.quantity) {
      alert('الرجاء تعبئة البيانات الأساسية للقطعة المراد تخزينها.');
      return;
    }

    const createdItem: InventoryItem = {
      id: `i-${Date.now()}`,
      name: newItem.name,
      partNumber: newItem.partNumber,
      quantity: parseInt(newItem.quantity) || 0,
      minQuantity: parseInt(newItem.minQuantity) || 5,
      category: newItem.category,
      price: newItem.price ? parseFloat(newItem.price) : undefined,
      shelfLocation: newItem.shelfLocation || undefined,
      supplier: newItem.supplier || undefined,
      compatibleVehicles: newItem.compatibleVehicles 
        ? newItem.compatibleVehicles.split(',').map(v => v.trim()) 
        : undefined,
      image: newItem.image || undefined,
      brand: newItem.brand || undefined,
      sku: newItem.sku || undefined,
      condition: newItem.condition as any,
      boxQuantity: newItem.boxQuantity ? parseInt(newItem.boxQuantity) : undefined,
      weight: newItem.weight || undefined,
      lastOrderedDate: SYSTEM_ANCHOR_DATE,
      managerNotes: newItem.managerNotes || undefined
    };

    setItems(prev => [createdItem, ...prev]);
    setIsAddModalOpen(false);

    // Add entry transaction
    const newTx: InventoryTransaction = {
      id: `t-${Date.now()}`,
      itemId: createdItem.id,
      itemName: createdItem.name,
      partNumber: createdItem.partNumber,
      type: 'incoming',
      quantityDelta: createdItem.quantity,
      reason: 'تأسيس وجرد أولي للقطعة في الرف المستودعي',
      operator: user.name,
      date: SYSTEM_ANCHOR_DATE
    };
    setTransactions(txs => [newTx, ...txs]);

    // Reset Form
    setNewItem({
      name: '',
      partNumber: '',
      quantity: '',
      minQuantity: '',
      category: 'فلاتر',
      price: '',
      shelfLocation: '',
      supplier: '',
      compatibleVehicles: '',
      image: '',
      brand: '',
      sku: '',
      condition: 'new',
      boxQuantity: '',
      weight: '',
      managerNotes: ''
    });

    alert('تم توريد القطعة بنجاح إلى قاعدة بيانات المخزن وتحقيق دمج فوري.');
  };

  // Submit item updates
  const handleEditItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForEdit || !editItemState.name || !editItemState.partNumber) {
      alert('الرجاء كتابة الاسم والكود التسلسلي للقطعة.');
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === selectedItemForEdit.id) {
        return {
          ...item,
          name: editItemState.name || '',
          partNumber: editItemState.partNumber || '',
          minQuantity: typeof editItemState.minQuantity === 'string' ? parseInt(editItemState.minQuantity) : editItemState.minQuantity ?? 5,
          category: editItemState.category || 'أخرى',
          price: editItemState.price !== undefined ? parseFloat(editItemState.price as any) : undefined,
          shelfLocation: editItemState.shelfLocation || undefined,
          supplier: editItemState.supplier || undefined,
          compatibleVehicles: Array.isArray(editItemState.compatibleVehicles)
            ? editItemState.compatibleVehicles
            : typeof editItemState.compatibleVehicles === 'string'
              ? (editItemState.compatibleVehicles as string).split(',').map(v => v.trim())
              : undefined,
          image: editItemState.image || undefined,
          brand: editItemState.brand || undefined,
          sku: editItemState.sku || undefined,
          condition: editItemState.condition as any,
          boxQuantity: editItemState.boxQuantity ? parseInt(editItemState.boxQuantity as any) : undefined,
          weight: editItemState.weight || undefined,
          managerNotes: editItemState.managerNotes || undefined,
        };
      }
      return item;
    }));

    setIsEditModalOpen(false);
    setSelectedItemForEdit(null);
    setEditItemState({});
    alert('تم تعديل بيانات القطعة وحفظها بنجاح!');
  };

  // Submit Detailed Transaction Flow
  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForTx || !txQty) return;

    const qtyVal = parseInt(txQty);
    if (qtyVal <= 0) {
      alert('الرجاء إدخال كمية صحيحة.');
      return;
    }

    if (txType === 'outgoing' && qtyVal > selectedItemForTx.quantity) {
      alert('الكمية المطلوبة تتعدى المخزون المتوفر!');
      return;
    }

    const multiplier = txType === 'incoming' ? 1 : -1;
    const finalDelta = qtyVal * multiplier;

    handleQuickQuantityOffset(selectedItemForTx.id, finalDelta, txReason || `طلب رسمي من قسم المعدات`);
    setIsTxModalOpen(false);
    setSelectedItemForTx(null);
    setTxQty('');
    setTxReason('');
    alert('تم تدوين الحركة اللوجستية وتعديل حصاد المعروض حالاً.');
  };

  // Delete inventory item entirely
  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في شطب صنف ${name} من قائمة المستودعات؟`)) {
      setItems(prev => prev.filter(item => item.id !== id));
      alert('تم إزالة القطعة وتحديث المؤشرات الفنية للشركة.');
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
              <Warehouse size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  {language === 'ar' ? 'إدارة منشآت المخازن والقطع' : 'Spare Parts & Inventory Warehouse'}
                </h1>
                <ContextualHelp 
                  id="inventory"
                  titleAr="إدارة منشآت المخازن والقطع"
                  titleEn="Spare Parts & Inventory Warehouse"
                  explanationAr="نظام جرد وتتبع لوجستي متقدم لقطع الغيار والمحركات والزيوت المخصصة للأسطول، لمراقبة كميات المخزون وتفادي النفاذ الفجائي ومعالجة باركود القطع."
                  explanationEn="A comprehensive stock keeping terminal for standard heavy vehicle spares, tires, and machine fluids, tracking safety alert thresholds and generating barcodes."
                  benefitsAr={[
                    "تنبيه تلقائي ذكي عند هبوط أي قطعة غيار تحت حد الأمان المطلوب.",
                    "توليد فوري لـ Barcode وعرضه ميكانيكيّاً بنمط Code 39 المتطور.",
                    "سهولة معالجة حركات التوريد والصرف الفني للورش الميدانية."
                  ]}
                  benefitsEn={[
                    "Dispatches safety warnings when spares drop below pre-set absolute thresholds.",
                    "Creates and displays Code 39 structured vector barcodes directly.",
                    "Keeps logs of stock movement (incoming from suppliers to outgoing repair jobs)."
                  ]}
                  tipsAr={[
                    "اضغط فرز 'مستوى متدني' لتحديد القطع التي أوشكت على النفاد والبدء فوريّاً في طلبها من المورد للتفادي التام لتعطيل الورش الميدانية."
                  ]}
                  tipsEn={[
                    "Sort items by 'Low Stock' to isolate parts that require immediate purchase orders before workshop operations bottleneck."
                  ]}
                  language={language}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تتبع كلي لقطع الغيار، الإطارات والزيوت وسوائل الآلات مع حدود التنبيه التلقائي وسجل توريد وجرد متكامل.
              </p>
            </div>
          </div>
        </div>

        {/* Option Selection and additions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-705 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-855'
              }`}
            >
              <Box size={13} />
              <span>أصناف قطع الغيار</span>
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'logs' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-855'
              }`}
            >
              <History size={13} />
              <span>حركة التوريد والصرف</span>
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'audit' 
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-855'
              }`}
            >
              <ClipboardCheck size={13} />
              <span>تدقيق جرد المخزون</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-55 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/30 rounded-xl text-xs font-black shadow-soft transition-all active:scale-95 cursor-pointer"
            >
              <Camera size={15} className="animate-pulse" />
              <span>مسح الباركود بالكاميرا</span>
            </button>

            {user.role !== 'viewer' && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsBulkPrintModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black shadow-soft hover:bg-slate-50 dark:hover:bg-slate-755 transition-all active:scale-95 cursor-pointer relative"
                >
                  <Printer size={15} className="text-indigo-600 dark:text-indigo-400" />
                  <span>محطة ملصقات الباركود</span>
                  {printQueue.length > 0 && (
                    <span className="mr-1 px-1.5 py-0.5 bg-rose-500 text-white font-mono text-[9px] font-black rounded-full animate-pulse">
                      {printQueue.reduce((acc, q) => acc + q.copies, 0)}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>إدخال صنف جديد</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'أصناف المسجلة في الرفوف', 
            val: `${totalItems} صنفاً مفرداً`, 
            desc: 'إجمالي التنوع المستودعي', 
            icon: <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />,
            bg: 'bg-indigo-100/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 hover:border-indigo-300',
            text: 'text-indigo-955 dark:text-indigo-100',
            labelColor: 'text-indigo-800 dark:text-indigo-300',
            descColor: 'text-indigo-750 dark:text-indigo-400/80',
            iconBg: 'bg-white/90 dark:bg-indigo-905/60 shadow-xs'
          },
          { 
            label: 'وحدات مخزنة كلياً', 
            val: `${totalQuantitySum} وحدة ميكانيكية`, 
            desc: 'لكافة الأبواب والموارد', 
            icon: <Package size={18} className="text-emerald-600 dark:text-emerald-400" />,
            bg: 'bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300',
            text: 'text-emerald-955 dark:text-emerald-100',
            labelColor: 'text-emerald-800 dark:text-emerald-300',
            descColor: 'text-emerald-750 dark:text-emerald-400/80',
            iconBg: 'bg-white/90 dark:bg-emerald-905/60 shadow-xs'
          },
          { 
            label: 'القيمة التقديرية للأصول', 
            val: `${totalStockValue.toLocaleString()} ر.س`, 
            desc: 'رأس مال البضاعة في الرف', 
            icon: <DollarSign size={18} className="text-amber-600 dark:text-amber-400" />,
            bg: 'bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 hover:border-amber-300',
            text: 'text-amber-955 dark:text-amber-100',
            labelColor: 'text-amber-800 dark:text-amber-300',
            descColor: 'text-amber-750 dark:text-amber-400/80',
            iconBg: 'bg-white/90 dark:bg-amber-905/60 shadow-xs'
          },
          { 
            label: 'النقص وطلب التوريد العاجل', 
            val: `${understockItems.length} أصناف تحت الحد السليم`, 
            desc: 'قطع قاربت على النفاد الفعلي', 
            icon: <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400" />, 
            pulse: understockItems.length > 0,
            bg: 'bg-rose-100/85 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 hover:border-rose-300',
            text: 'text-rose-955 dark:text-rose-100',
            labelColor: 'text-rose-800 dark:text-rose-300',
            descColor: 'text-rose-750 dark:text-rose-400/80',
            iconBg: 'bg-white/90 dark:bg-rose-905/60 shadow-xs'
          },
        ].map((met, idx) => (
          <div key={idx} className={`p-4 rounded-2xl border ${met.bg} shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group`}>
            <div className="space-y-1 text-right">
              <span className={`text-[10px] font-black block tracking-wide ${met.labelColor}`}>{met.label}</span>
              <span className={`text-base font-black font-mono leading-none block ${met.text}`}>{met.val}</span>
              <span className={`text-[8.5px] font-bold block ${met.descColor}`}>{met.desc}</span>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${met.iconBg} ${met.pulse ? 'animate-bounce border border-rose-300 text-rose-500' : ''}`}>
              {met.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Container tabs */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          
          {/* Controls filtering bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-soft flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl flex-1 w-full">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="ابحث بالاسم، كود الصنف، موقع المستودع (مثال: أ-3)، اسم المورد أو المركبة المتوافقة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white w-full font-bold animate-none"
              />
              <button
                onClick={() => setIsScannerOpen(true)}
                className="p-1 px-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/40 dark:border-indigo-900/40 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
                title="افتح قارئ الباركود"
              >
                <Camera size={11} />
                <span>مسح</span>
              </button>
            </div>

            {/* Filters selectors and health criteria */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex bg-slate-100 dark:bg-slate-900/90 p-1 rounded-lg border border-slate-200/50 dark:border-slate-800">
                <button
                  onClick={() => setStockStatusFilter('all')}
                  className={`px-3 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${stockStatusFilter === 'all' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'}`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setStockStatusFilter('low')}
                  className={`px-3 py-1 rounded text-[10px] font-black cursor-pointer transition-all flex items-center gap-1 ${stockStatusFilter === 'low' ? 'bg-rose-500 text-white shadow-xs' : 'text-rose-500'}`}
                >
                  🔔 نقص حرج ({understockItems.length})
                </button>
                <button
                  onClick={() => setStockStatusFilter('healthy')}
                  className={`px-3 py-1 rounded text-[10px] font-black cursor-pointer transition-all ${stockStatusFilter === 'healthy' ? 'bg-emerald-500 text-white shadow-xs' : 'text-emerald-500'}`}
                >
                  سليم بالمخازن
                </button>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none cursor-pointer"
              >
                <option value="all">كل الفئات الميكانيكية</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="flex bg-slate-100 dark:bg-slate-900/90 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-450 shadow-sm font-black' : 'text-slate-500 hover:text-slate-700'}`}
                  title="عرض شبكة (Grid)"
                >
                  <Grid size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-455 shadow-sm font-black' : 'text-slate-500 hover:text-slate-700'}`}
                  title="عرض قائمة (List)"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>



          {/* Understock Alert card notification helper */}
          {understockItems.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 p-4 rounded-2xl border border-amber-200/30 dark:border-amber-900/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-black"
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-amber-500 animate-bounce shrink-0" />
                <span>يرجى الملاحظة بموج وجود ({understockItems.length}) أصناف ميكانيكية استراتيجية تقع حالاً تحت الحدود الآمنة للمخازن. يتوجب الاتصال بالوكلاء.</span>
              </div>
              <button 
                onClick={() => setStockStatusFilter('low')}
                className="px-3 py-1.5 bg-amber-600 dark:bg-amber-900 text-white dark:text-amber-200 rounded-lg text-[10px] font-black hover:bg-amber-700 cursor-pointer self-stretch text-center"
              >
                عرض العجز الاستدعائي
              </button>
            </motion.div>
          )}

          {/* Core Parts Inventory Layout (Switchable Grid vs List) */}
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "flex flex-col gap-3"
          }>
            <AnimatePresence mode="popLayout">
              {filteredItems.map(item => {
                const isCritical = item.quantity <= item.minQuantity;
                const statusStripe = isCritical 
                  ? 'border-r-[6px] border-r-rose-500 hover:border-r-rose-600 bg-rose-500/0 dark:bg-rose-950/5' 
                  : 'border-r-[6px] border-r-emerald-500 hover:border-r-emerald-600 bg-emerald-500/0 dark:bg-emerald-950/5';
                
                const conditionText = {
                  'new': 'جديد',
                  'used': 'مستعمل',
                  'refurbished': 'مجدد'
                }[item.condition || 'new'] || 'جديد';

                const conditionColor = {
                  'new': 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
                  'used': 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
                  'refurbished': 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                }[item.condition || 'new'] || 'bg-emerald-50 text-emerald-600';

                if (viewMode === 'grid') {
                  // GRID VIEW CARD
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className={`bg-white dark:bg-[#0f1422] rounded-2xl border border-slate-155 dark:border-slate-800 transition-all hover:shadow-xl flex flex-col justify-between overflow-hidden ${statusStripe}`}
                    >
                      {/* Card Image Area with Overlays */}
                      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-950 overflow-hidden group/img shrink-0">
                        <img 
                          src={getPartImage(item)} 
                          referrerPolicy="no-referrer"
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
                        
                        {/* Category badge */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-white/95 dark:bg-[#0f1422]/90 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-100/10">
                            {item.category}
                          </span>
                        </div>

                        {/* Top left Condition badge */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black shadow-sm ${conditionColor}`}>
                            {conditionText}
                          </span>
                        </div>

                        {/* Brand on lower-right image overlay */}
                        <div className="absolute bottom-2 right-3 left-3 flex justify-between items-center text-[10px] font-bold text-white max-w-full">
                          <span className="bg-indigo-605 block dark:bg-indigo-600/90 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] font-black">
                            {item.brand || 'هيكل ميكانيكي'}
                          </span>
                          <span className="font-mono bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[8.5px] tracking-wide text-slate-100 border border-slate-400/20">
                            SKU-{item.sku || item.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="text-xs font-black text-slate-900 dark:text-white leading-tight min-h-[32px] line-clamp-2">
                              {item.name}
                            </h3>
                          </div>

                          {/* Quick specs details list representation */}
                          <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-800/40">
                              <MapPin size={10} className="text-slate-455 dark:text-slate-400" />
                              <span className="text-slate-500">موقع:</span>
                              <span className="font-extrabold text-slate-750 dark:text-slate-300 truncate">{item.shelfLocation || 'رف عام'}</span>
                            </div>

                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-800/40">
                              <DollarSign size={10} className="text-slate-455 dark:text-slate-400" />
                              <span className="text-slate-500">السعر:</span>
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-450">{item.price ? `${item.price} ر.س` : 'اتصل'}</span>
                            </div>

                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-800/40">
                              <Package size={10} className="text-slate-455 dark:text-slate-400" />
                              <span className="text-slate-500">تعبئة:</span>
                              <span className="font-extrabold text-slate-750 dark:text-slate-300">{item.boxQuantity ? `${item.boxQuantity} ق/علبة` : 'تعبئة حرة'}</span>
                            </div>

                            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/60 p-1.5 rounded-lg border border-slate-100/50 dark:border-slate-800/40">
                              <Layers3 size={10} className="text-slate-455 dark:text-slate-400" />
                              <span className="text-slate-500">الوزن:</span>
                              <span className="font-extrabold text-slate-750 dark:text-slate-300">{item.weight || 'غير محدد'}</span>
                            </div>
                          </div>

                          {/* Compatible vehicles list of parts */}
                          {item.compatibleVehicles && item.compatibleVehicles.length > 0 && (
                            <div className="pt-1">
                              <div className="flex flex-wrap gap-1">
                                {item.compatibleVehicles.slice(0, 3).map((v, i) => (
                                  <span key={i} className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20">
                                    {v}
                                  </span>
                                ))}
                                {item.compatibleVehicles.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-slate-100 text-slate-500">
                                    +{item.compatibleVehicles.length - 3} أخرى
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Manager Notes Row */}
                          {item.managerNotes && (
                            <div className="bg-amber-500/5 border border-amber-500/10 dark:border-amber-500/5 p-2 rounded-lg text-[9px] text-amber-700 dark:text-amber-400/90 leading-relaxed max-h-16 overflow-y-auto font-medium">
                              <span className="font-black text-amber-850 dark:text-amber-300 block mb-0.5">📝 ملاحظة مدير المستودع:</span>
                              {item.managerNotes}
                            </div>
                          )}

                          {/* Barcode and actions preview */}
                          <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="w-1/2 p-1 bg-white rounded border border-slate-100/50 flex justify-center items-center">
                              <Barcode val={item.partNumber} height={16} showText={false} />
                            </div>
                            <button
                              type="button"
                              onClick={() => addToPrintQueue(item, 1)}
                              className="flex items-center justify-center gap-1 text-[8.5px] px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-black transition-all cursor-pointer"
                              title="إضافة ملصق باركود للطباعة"
                            >
                              <Printer size={9} />
                              <span>طابور الباركود</span>
                            </button>
                          </div>
                        </div>

                        {/* Stock level indicators & controls */}
                        <div className="border-t border-slate-100 dark:border-slate-800/50 pt-2.5 flex items-center justify-between mt-2.5">
                          <div className="space-y-0.5 text-right">
                            <span className="text-[8px] font-bold text-slate-400 block">الرصيد الفعلي المتوفر:</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-sm font-mono font-black ${isCritical ? 'text-rose-600 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                                {item.quantity} وحدة
                              </span>
                              <span className="text-[8px] text-slate-400 font-bold">/ حد {item.minQuantity}</span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          {user.role !== 'viewer' ? (
                            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 px-1.5 py-1 rounded-xl border border-slate-250/20 dark:border-slate-800">
                              <button
                                onClick={() => handleQuickQuantityOffset(item.id, -1, 'سحب تشغيلي سريع من الرف')}
                                disabled={item.quantity === 0}
                                className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center text-rose-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer text-[10px]"
                                title="سحب قطعة"
                              >
                                <Minus size={10} />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedItemForTx(item);
                                  setIsTxModalOpen(true);
                                }}
                                className="px-1.5 py-1 text-[8.5px] font-black text-slate-600 dark:text-slate-455 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-all cursor-pointer flex items-center gap-0.5"
                                title="سجل حركة لوجستية"
                              >
                                <span>حركة</span>
                              </button>

                              <button
                                onClick={() => handleQuickQuantityOffset(item.id, 1, 'توريد معزز وتعديل أرفف')}
                                className="w-5 h-5 rounded-lg bg-white dark:bg-slate-800 shadow-xs flex items-center justify-center text-emerald-500 hover:bg-slate-50 cursor-pointer text-[10px]"
                                title="إضافة قطعة"
                              >
                                <Plus size={10} fill="currentColor" />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-md ${isCritical ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                              {isCritical ? 'يتطلب إعادة تمويل' : 'رصيد سليم'}
                            </span>
                          )}
                        </div>

                        {/* Admin Action Buttons */}
                        {user.role !== 'viewer' && (
                          <div className="flex justify-between items-center mt-2.5 pt-2 border-t border-dashed border-slate-100 dark:border-slate-800">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItemForEdit(item);
                                setEditItemState({
                                  name: item.name,
                                  partNumber: item.partNumber,
                                  minQuantity: item.minQuantity,
                                  category: item.category,
                                  price: item.price,
                                  shelfLocation: item.shelfLocation,
                                  supplier: item.supplier,
                                  compatibleVehicles: item.compatibleVehicles ? item.compatibleVehicles.join(', ') : '',
                                  image: item.image || '',
                                  brand: item.brand || '',
                                  sku: item.sku || '',
                                  condition: item.condition || 'new',
                                  boxQuantity: item.boxQuantity ? String(item.boxQuantity) : '',
                                  weight: item.weight || '',
                                  managerNotes: item.managerNotes || ''
                                });
                                setIsEditModalOpen(true);
                              }}
                              className="text-[9px] font-bold text-indigo-650 hover:text-indigo-855 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-0.5 transition-all cursor-pointer"
                            >
                              <Edit3 size={9} />
                              <span>تعديل تفاصيل مدير المخزن</span>
                            </button>

                            {/* Delete Button */}
                            {user.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteItem(item.id, item.name)}
                                className="text-[9px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 transition-all cursor-pointer"
                              >
                                <Trash2 size={9} />
                                <span>شطب صنف</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                } else {
                  // LIST VIEW ROW
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`bg-white dark:bg-[#0f1422] rounded-xl border border-slate-100 dark:border-slate-800 px-4 py-2.5 hover:bg-indigo-50/10 dark:hover:bg-slate-800/10 hover:shadow-xs transition-all duration-250 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-right ${statusStripe}`}
                    >
                      {/* Left: Thumbnail & Name Column */}
                      <div className="flex items-center gap-3 w-full md:w-2/5 min-w-0">
                        <img 
                          src={getPartImage(item)} 
                          referrerPolicy="no-referrer"
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[8px] font-extrabold font-sans">
                              {item.category}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black shadow-sm shrink-0 font-sans tracking-wide border border-indigo-100/10 dark:border-indigo-900/10 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350">
                              {item.brand || 'عام'}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate" title={item.name}>
                            {item.name}
                          </h4>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            Part: {item.partNumber} • SKU: {item.sku || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Details parameters (Rack, Price, Weight, Box Qty) */}
                      <div className="grid grid-cols-4 gap-2 text-[10px] w-full md:w-2/5 font-bold">
                        <div>
                          <span className="text-slate-400 text-[8.5px] block font-sans">الرفّ:</span>
                          <span className="text-slate-800 dark:text-slate-200 flex items-center gap-0.5">
                            <MapPin size={9} className="text-slate-400" />
                            {item.shelfLocation || 'رف عام'}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-slate-400 text-[8.5px] block font-sans">السعر:</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                            {item.price ? `${item.price} ر.س` : 'اتصل'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[8.5px] block font-sans font-black">العلبة:</span>
                          <span className="text-slate-500 font-sans block">{item.boxQuantity ? `${item.boxQuantity} قطع` : 'تعبئة حرة'}</span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[8.5px] block font-sans">الوزن:</span>
                          <span className="text-slate-500 font-sans block">{item.weight || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Right: Quantity indicators and controls */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-1/5 shrink-0 border-t md:border-t-0 border-slate-100 pt-2 md:pt-0">
                        {/* Status Label and qty */}
                        <div className="text-right flex items-center gap-2">
                          <div className="space-y-0.5">
                            <span className="text-slate-400 text-[8px] block font-sans">الكمية:</span>
                            <span className={`text-[12px] font-mono font-extrabold ${isCritical ? 'text-rose-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>
                              {item.quantity} وحدة
                            </span>
                          </div>
                          <span className={`px-1 rounded text-[8px] font-black shrink-0 ${conditionColor}`}>
                            {conditionText}
                          </span>
                        </div>

                        {/* Increments and edits */}
                        <div className="flex items-center gap-1.5">
                          {user.role !== 'viewer' && (
                            <>
                              {/* Quick edit config */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedItemForEdit(item);
                                  setEditItemState({
                                    name: item.name,
                                    partNumber: item.partNumber,
                                    minQuantity: item.minQuantity,
                                    category: item.category,
                                    price: item.price,
                                    shelfLocation: item.shelfLocation,
                                    supplier: item.supplier,
                                    compatibleVehicles: item.compatibleVehicles ? item.compatibleVehicles.join(', ') : '',
                                    image: item.image || '',
                                    brand: item.brand || '',
                                    sku: item.sku || '',
                                    condition: item.condition || 'new',
                                    boxQuantity: item.boxQuantity ? String(item.boxQuantity) : '',
                                    weight: item.weight || '',
                                    managerNotes: item.managerNotes || ''
                                  });
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1 px-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-semibold cursor-pointer shrink-0"
                                title="تعديل التفاصيل الفنية للمستودعات"
                              >
                                <Edit3 size={11} />
                              </button>

                              {/* quick decrement */}
                              <button
                                onClick={() => handleQuickQuantityOffset(item.id, -1, 'سحب تشغيلي سريع من الرف')}
                                disabled={item.quantity === 0}
                                className="w-5 h-5 rounded hover:bg-slate-150 bg-slate-50 dark:bg-slate-800 text-rose-500 font-bold flex items-center justify-center cursor-pointer text-xs disabled:opacity-40"
                              >
                                <Minus size={9} />
                              </button>

                              {/* quick increment */}
                              <button
                                onClick={() => handleQuickQuantityOffset(item.id, 1, 'توريد معزز وتعديل أرفف')}
                                className="w-5 h-5 rounded hover:bg-slate-150 bg-slate-50 dark:bg-slate-800 text-emerald-500 font-bold flex items-center justify-center cursor-pointer text-xs"
                              >
                                <Plus size={9} />
                              </button>
                            </>
                          )}

                          {user.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                              title="حذف القطعة بالكامل"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                    </motion.div>
                  );
                }
              })}
            </AnimatePresence>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-150 dark:border-slate-850">
              <span className="text-slate-400 font-extrabold text-base block mb-1">لا تطابق سجلات الجرد الحالية طلبات بحثك.</span>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">جرب تخفيف قيود التصفية أو تغيير الكلمات الدلالية أو فئة محرك البحث للآلات.</p>
              <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setStockStatusFilter('all'); }} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-slate-700 dark:text-indigo-400 rounded-xl text-xs font-black cursor-pointer">
                تفريغ مرشح البيانات
              </button>
            </div>
          )}

        </div>
      )}

      {activeTab === 'logs' && (
        // RENDER LOGS TAB PANEL
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">جدول تدقيق ومطابقة اللوجستيات</h3>
              <p className="text-[10px] text-slate-500">سجل تراكمي آلي لكافة عمليات شحن الموارد من وإلى مستودع المجمع.</p>
            </div>
            <button 
              onClick={() => {
                if (confirm('هل ترغب بتصفير سجل الحركات لإغلاق الفترة المالية السابقة وتأسيس دوفعة جديدة؟')) {
                  setTransactions([]);
                  alert('تم تفريغ الأرشيف بنجاح للدفعة الجديدة.');
                }
              }}
              className="text-[10px] text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={10} />
              <span>تفريغ السجل</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-black h-10 border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3">تاريخ الحركة</th>
                  <th className="p-3">صنف القطعة</th>
                  <th className="p-3">الكود التسلسلي</th>
                  <th className="p-3">اتجاه المورد</th>
                  <th className="p-3">الكمية المسحوبة / الموردة</th>
                  <th className="p-3">سبب الإجراء الفني ومآله</th>
                  <th className="p-3">ممرر الطلب</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b last:border-none border-slate-100 dark:border-slate-800 hover:bg-indigo-50/40 dark:hover:bg-[#1a233a]/60 hover:text-slate-905 dark:hover:text-white transition-all duration-150">
                    <td className="p-3 font-mono font-bold text-slate-400">{tx.date}</td>
                    <td className="p-3 font-black text-slate-800 dark:text-slate-200">{tx.itemName}</td>
                    <td className="p-3 font-mono text-slate-500">{tx.partNumber}</td>
                    <td className="p-3">
                      {tx.type === 'incoming' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center gap-1 w-fit">
                          <TrendingUp size={10} />
                          توريد شحن خارجي
                        </span>
                      )}
                      {tx.type === 'outgoing' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center gap-1 w-fit">
                          <TrendingDown size={10} />
                          صرف ميكانيكي داخلي
                        </span>
                      )}
                      {tx.type === 'adjust' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-black bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center gap-1 w-fit">
                          <ArrowRightLeft size={10} />
                          تسوية وجرد رفوف
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-black text-slate-800 dark:text-slate-100">
                      {tx.type === 'incoming' ? '+' : '-'}{tx.quantityDelta} قطع
                    </td>
                    <td className="p-3 font-medium text-slate-500 max-w-xs truncate">{tx.reason}</td>
                    <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{tx.operator}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-10 font-bold text-slate-400">لا يوجد حركات لوجستية منشورة بعد في الفترة الحالية.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in" dir="rtl">
          
          {/* Audit Banner */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-600/5 to-transparent border border-indigo-150/50 dark:border-indigo-950/40 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <ClipboardCheck className="text-indigo-600 dark:text-indigo-400 shrink-0" size={18} />
                <span>دورة تدقيق ومطابقة جرد المخازن الدورية</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                هنا يتم جرد ورفع كميات القطع والأرفف ومقارنتها بسجلات النظام الدفترية لتسجيل الفروقات ومعايرتها آلياً بموجب حركات تسوية معززة لضمان جودة الحسابات.
              </p>
            </div>
            
            {user.role !== 'viewer' && (
              <div className="flex items-center gap-2 self-start md:self-auto uppercase shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const updated: Record<string, { count: number; note: string }> = {};
                    items.forEach(item => {
                      updated[item.id] = {
                        count: item.quantity,
                        note: auditCounts[item.id]?.note || ''
                      };
                    });
                    setAuditCounts(updated);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-[10px] font-black rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  ✨ تطابق افتراضي للكل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل ترغب بتصفير كافة مدخلات كميات العد الفعّال؟')) {
                      setAuditCounts({});
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/30 dark:border-rose-900/30 text-[10px] font-black rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  🧹 تصفير المدخلات
                </button>
              </div>
            )}
          </div>

          {/* Audit Statistics Summary Bento Block */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'أصناف تشملها دورة الجرد',
                val: `${items.length} أصناف`,
                desc: 'إجمالي الأصناف الخاضعة للمراجعة القائمة',
                icon: <Box size={16} className="text-slate-600 dark:text-slate-400" />,
                bg: 'bg-slate-100/80 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/40 hover:border-slate-350',
                text: 'text-slate-950 dark:text-slate-100',
                labelColor: 'text-slate-700 dark:text-slate-300',
                descColor: 'text-slate-600 dark:text-slate-400/80',
                iconBg: 'bg-white/95 dark:bg-slate-800/60 shadow-xs'
              },
              {
                label: 'الأصناف المعدلة مع فروقات',
                val: `${Object.keys(auditCounts).filter(id => {
                  const val = auditCounts[id]?.count;
                  const item = items.find(it => it.id === id);
                  return val !== undefined && item && val !== item.quantity;
                }).length} أصناف متباينة`,
                desc: 'قطع تختلف كمياتها الفعلية المكتشفة',
                icon: <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />,
                bg: 'bg-amber-100/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 hover:border-amber-300',
                text: 'text-amber-955 dark:text-amber-100',
                labelColor: 'text-amber-800 dark:text-amber-300',
                descColor: 'text-amber-700/80 dark:text-amber-400/80',
                iconBg: 'bg-white/90 dark:bg-amber-905/60 shadow-xs'
              },
              {
                label: 'إجمالي وحدات الفروقات الحسابية',
                val: (() => {
                  let totalSurplus = 0;
                  let totalDeficit = 0;
                  Object.keys(auditCounts).forEach(id => {
                    const val = auditCounts[id]?.count;
                    const item = items.find(it => it.id === id);
                    if (val !== undefined && item) {
                      const diff = val - item.quantity;
                      if (diff > 0) totalSurplus += diff;
                      else if (diff < 0) totalDeficit += Math.abs(diff);
                    }
                  });
                  return `+${totalSurplus} فائض / -${totalDeficit} عجز`;
                })(),
                desc: 'إجمالي الأحجام المكتشفة بالعد المادي',
                icon: <ArrowRightLeft size={16} className="text-indigo-600 dark:text-indigo-400" />,
                bg: 'bg-indigo-100/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40 hover:border-indigo-300',
                text: 'text-indigo-955 dark:text-indigo-100',
                labelColor: 'text-indigo-800 dark:text-indigo-300',
                descColor: 'text-indigo-750 dark:text-indigo-400/80',
                iconBg: 'bg-white/90 dark:bg-indigo-905/60 shadow-xs'
              },
              {
                label: 'صافي فرق القيمة المالية المترتبة',
                val: (() => {
                  let netCost = 0;
                  Object.keys(auditCounts).forEach(id => {
                    const val = auditCounts[id]?.count;
                    const item = items.find(it => it.id === id);
                    if (val !== undefined && item) {
                      const diff = val - item.quantity;
                      netCost += diff * (item.price || 0);
                    }
                  });
                  return `${netCost.toLocaleString()} ر.س`;
                })(),
                desc: 'القيمة المالية لإعادة التسوية الجردية',
                icon: <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />,
                bg: 'bg-emerald-100/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300',
                text: 'text-emerald-955 dark:text-emerald-100',
                labelColor: 'text-emerald-800 dark:text-emerald-300',
                descColor: 'text-emerald-750 dark:text-emerald-400/80',
                iconBg: 'bg-white/90 dark:bg-emerald-905/60 shadow-xs'
              }
            ].map((met, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border ${met.bg} shadow-md hover:shadow-lg transition-all duration-300 -translate-y-[1px] hover:-translate-y-[3px] flex items-center justify-between group`}>
                <div className="space-y-1 text-right">
                  <span className={`text-[10px] font-black block tracking-wide ${met.labelColor}`}>{met.label}</span>
                  <span className={`text-sm font-black font-mono leading-none block ${met.text}`}>{met.val}</span>
                  <span className={`text-[8.5px] font-bold block ${met.descColor}`}>{met.desc}</span>
                </div>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${met.iconBg}`}>
                  {met.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Audit Workspace Sheet */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/80 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">جدول جرد المخزون ومطابقة الأرصدة القائمة</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">قم بتعديل حقل "الكمية الفعلية" بأرقام العد الملموس بيدك، وسيتم فورياً احتساب التباين.</p>
              </div>

              {/* Quick filter block */}
              <div className="flex items-center gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold dark:text-white outline-none cursor-pointer"
                >
                  <option value="all">كل الفئات للقطع</option>
                  {categories.filter(c => c !== 'all').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg">
                  <Search size={12} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث سريع للقطع المجرودة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-[11px] text-slate-900 dark:text-white w-32 font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 font-black h-10 border-b border-slate-100 dark:border-slate-800">
                    <th className="p-3 w-12">الرفّ</th>
                    <th className="p-3">اسم القطعة والرمز للرفوف</th>
                    <th className="p-3 text-center">الكمية الدفترية</th>
                    <th className="p-3 text-center w-40">الكمية الفعلية المجرودة</th>
                    <th className="p-3 text-center">الفارق الفعلي المكتشف</th>
                    <th className="p-3">ملاحظة تدقيق التسوية بمطابقة الأرفف</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => {
                    const customValue = auditCounts[item.id]?.count;
                    const resolvedCount = customValue !== undefined ? customValue : item.quantity;
                    const resolvedNote = auditCounts[item.id]?.note || '';
                    const delta = resolvedCount - item.quantity;
                    const isReaderOnly = user.role === 'viewer';

                    return (
                      <tr key={item.id} className="border-b last:border-none border-slate-100 dark:border-slate-800/80 hover:bg-indigo-50/40 dark:hover:bg-[#1a233a]/60 hover:text-slate-905 dark:hover:text-white transition-all duration-150">
                        <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-350">{item.shelfLocation || 'غير محدد'}</td>
                        <td className="p-3">
                          <div className="space-y-0.5" dir="rtl">
                            <span className="font-extrabold text-slate-850 dark:text-slate-100 block">{item.name}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{item.partNumber} • {item.category}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-500">{item.quantity} وحدة</td>
                        <td className="p-3 text-center">
                          {isReaderOnly ? (
                            <span className="font-mono font-bold text-slate-700">{resolvedCount} وحدة</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 mx-auto w-32">
                              <button
                                type="button"
                                onClick={() => {
                                  setAuditCounts(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      count: Math.max(0, resolvedCount - 1),
                                      note: resolvedNote
                                    }
                                  }));
                                }}
                                className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer text-xs"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                value={resolvedCount}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setAuditCounts(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      count: isNaN(val) ? 0 : val,
                                      note: resolvedNote
                                    }
                                  }));
                                }}
                                className="w-14 p-1 focus:border-indigo-500 font-mono text-center font-bold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setAuditCounts(prev => ({
                                    ...prev,
                                    [item.id]: {
                                      count: resolvedCount + 1,
                                      note: resolvedNote
                                    }
                                  }));
                                }}
                                className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {delta === 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-slate-50 dark:bg-slate-900/60 text-slate-400 border border-slate-200/50 dark:border-slate-800">
                              مطابق
                            </span>
                          ) : delta > 0 ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/25">
                              +{delta} زيادة (فائض)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/25">
                              {delta} نقص (عجز)
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            disabled={isReaderOnly}
                            placeholder={isReaderOnly ? "لا توجد ملاحظات وصلاحيات" : "اكتب ملاحظة التسوية (تلف، عيب مصنعي، عد متكرر...)"}
                            value={resolvedNote}
                            onChange={(e) => {
                              setAuditCounts(prev => ({
                                ...prev,
                                [item.id]: {
                                  count: resolvedCount,
                                  note: e.target.value
                                }
                              }));
                            }}
                            className="w-full p-2 bg-slate-50/60 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 rounded-xl font-bold dark:text-white text-[10px] outline-none placeholder-slate-400"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 font-bold text-slate-400">لا يوجد أصناف مطابقة للتصفية الحالية.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Posting and Save Actions form panel */}
            <div className="p-5 border-t border-slate-150 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/20">
              <form onSubmit={handlePostAudit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-black text-slate-500 block">ملاحظات توثيق دورة الجرد العامة وملخص التدقيق</label>
                    <input
                      type="text"
                      placeholder="مثال: جرد شامل لنهاية الفترة لربع السنة الثاني مع استبعاد التوالف المعيبة..."
                      value={auditNotes}
                      onChange={(e) => setAuditNotes(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">المسؤول الفني بالعد والتحقق من الرفوف</label>
                    <div className="w-full p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-750 dark:text-slate-300">
                      👤 {user.name} ({user.role === 'admin' ? 'مدير نظام فائق' : 'فني جودة وميكانيكا'})
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-dashed border-slate-250 dark:border-slate-700 font-bold">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal max-w-xl font-medium" dir="rtl">
                    💡 <span className="font-extrabold text-indigo-650 dark:text-indigo-400">منظومة التسوية الآمنة:</span> ترحيل الجرد سيقوم بتعديل أرصدة القطع وتثبيتها في شاشات المخزن فوراً، مع إنشاء قيود تسويات جردية وتوثيقها في "حركات المخزن" و"أرشيف دورات الجرد التاريخية".
                  </div>
                  
                  <button
                    type="submit"
                    disabled={user.role === 'viewer'}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    تثبيت واعتماد دورة الجرد الفعالة 🗄️
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* HISTORICAL COMPLETED STOCK AUDITS HISTORY PANEL */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-705 shadow-soft overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-705 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <History size={15} className="text-indigo-500" />
                  <span>سجل دورات الجرد التاريخية المكتملة</span>
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">أرشيف دوري للعمليات المنجزة مع الفروقات والمبررات وتعديلات الأسعار.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('هل ترغب بتصفير سجل أرشيف دورات الجرد التاريخية الموثقة؟')) {
                    setAuditHistory([]);
                  }
                }}
                className="text-[10px] text-rose-500 hover:underline font-bold cursor-pointer"
              >
                مسح الأرشيف تاريخياً
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {auditHistory.map((rec) => (
                <HistoricalAuditRow key={rec.id} record={rec} />
              ))}

              {auditHistory.length === 0 && (
                <div className="p-8 text-center text-slate-400 font-bold text-xs" dir="rtl">
                  لا توجد سجلات جرد تاريخية مكتملة حالياً. جرب كتابة الكميات الفعلية ثم انقر "تثبيت واعتماد دورة الجرد الفعالة" لتأسيس أول تسوية.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- BARCODE SCANNER MODAL --- */}
      <AnimatePresence>
        {isScannerOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsScannerOpen(false)}
                className="fixed inset-0 transition-opacity bg-slate-900/60 backdrop-blur-xs" 
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 inline-block w-full max-w-4xl p-0 my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-[#0c101d] shadow-2xl rounded-3xl border border-slate-150 dark:border-slate-800"
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-150 dark:border-slate-800 bg-indigo-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Camera size={18} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">
                        {language === 'ar' ? 'قارئ الباركود الذكي لقطع الغيار' : 'Smart Spare Parts Barcode Reader'}
                      </h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {language === 'ar' ? 'مسح رمز القطعة للتحقق من الأرفف وتسجيل حركة سحب أو توريد لحظية' : 'Scan part barcode to verify shelves or record instant transaction'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsScannerOpen(false)} 
                    className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-150 dark:divide-slate-800 max-h-[80vh] overflow-y-auto">
                  
                  {/* Left Column: Scanner viewfinder and simulation */}
                  <div className="lg:col-span-6 p-6 space-y-5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-550 animate-ping"></span>
                        <span>{language === 'ar' ? 'البث المباشر للكاميرا' : 'Live Camera Viewport'}</span>
                      </h4>

                      {/* Viewfinder Wrapper */}
                      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center group shadow-inner">
                        {cameraStream && !scannerError ? (
                          <>
                            <video 
                              ref={videoRef}
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                            
                            {/* Viewfinder guidelines overlay */}
                            <div className="absolute inset-0 border-[30px] border-black/40 pointer-events-none" />
                            
                            {/* Target frame corners */}
                            <div className="absolute top-8 left-8 border-t-4 border-l-4 border-emerald-500 w-8 h-8 rounded-tl-lg pointer-events-none" />
                            <div className="absolute top-8 right-8 border-t-4 border-r-4 border-emerald-500 w-8 h-8 rounded-tr-lg pointer-events-none" />
                            <div className="absolute bottom-8 left-8 border-b-4 border-l-4 border-emerald-500 w-8 h-8 rounded-bl-lg pointer-events-none" />
                            <div className="absolute bottom-8 right-8 border-b-4 border-r-4 border-emerald-500 w-8 h-8 rounded-br-lg pointer-events-none" />

                            {/* Red laser line */}
                            <motion.div 
                              animate={{ y: ['30%', '70%', '30%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                              className="absolute left-[10%] right-[10%] h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] pointer-events-none"
                            />

                            <div className="absolute bottom-3 bg-black/75 px-3 py-1 rounded-full text-[9px] text-emerald-400 font-bold border border-emerald-500/20">
                              {language === 'ar' ? 'جاري البحث عن كود شريطي...' : 'Searching for barcode...'}
                            </div>
                          </>
                        ) : (
                          <div className="p-6 text-center space-y-3 max-w-sm">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto animate-bounce">
                              <Camera size={24} className="opacity-60" />
                            </div>
                            <div className="text-xs font-bold text-slate-400">
                              {scannerError || (language === 'ar' ? 'يرجى تفعيل صلاحية الكاميرا لبدء القراءة.' : 'Please activate camera permissions to start.')}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simulation controls */}
                    <div className="space-y-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800">
                      <div>
                        <strong className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block">
                          ⚡ {language === 'ar' ? 'محاكي المسح التلقائي للأرفف (تجاوز الكاميرا):' : 'Instant Scanner Simulator (Override):'}
                        </strong>
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {language === 'ar' ? 'اختر أي قطعة من قاعدة البيانات الحية لمحاكاة قراءة ملصق الباركود الخاص بها بنجاح.' : 'Select any live spare part from database to simulate a successful laser scan.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                        {items.slice(0, 8).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleBarcodeDetected(item.partNumber)}
                            className="p-2 text-right bg-white hover:bg-indigo-50 dark:bg-slate-800/80 dark:hover:bg-indigo-950/40 border border-slate-150 dark:border-slate-750 rounded-xl text-[10px] font-bold cursor-pointer transition-colors group flex items-center justify-between gap-1.5"
                          >
                            <span className="truncate text-slate-700 dark:text-slate-300 font-bold group-hover:text-indigo-600">{item.name}</span>
                            <span className="font-mono text-[8px] bg-slate-100 dark:bg-slate-900 p-0.5 px-1.5 rounded-md text-slate-550 shrink-0">{item.partNumber}</span>
                          </button>
                        ))}
                      </div>

                      {/* Manual text scanner override */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder={language === 'ar' ? 'أدخل كود الصنف يدوياً واضغط إدخال...' : 'Enter part number manually...'}
                          value={scannedCodeText}
                          onChange={(e) => setScannedCodeText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleBarcodeDetected(scannedCodeText);
                              setScannedCodeText('');
                            }
                          }}
                          className="flex-1 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold dark:text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleBarcodeDetected(scannedCodeText);
                            setScannedCodeText('');
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer transition-colors"
                        >
                          {language === 'ar' ? 'فحص' : 'Check'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Scanned Item Details & Instant Transaction */}
                  <div className="lg:col-span-6 p-6 space-y-5 bg-slate-50/20 dark:bg-[#070a13]/10">
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {language === 'ar' ? 'بيانات القطعة المفحوصة والمطابقة' : 'Detected Spare Part Identity'}
                    </h4>

                    {scannerResult ? (
                      <div className="space-y-4">
                        {/* Part Info Card */}
                        <div className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
                          {/* Stock status badge */}
                          <div className="absolute top-4 left-4">
                            {scannerResult.quantity <= scannerResult.minQuantity ? (
                              <span className="p-1 px-2.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 rounded-full text-[9px] font-black border border-rose-100 dark:border-rose-900/30">
                                ⚠️ {language === 'ar' ? 'نقص بالرفوف' : 'Low Stock'}
                              </span>
                            ) : (
                              <span className="p-1 px-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 rounded-full text-[9px] font-black border border-emerald-100 dark:border-emerald-900/30">
                                ✓ {language === 'ar' ? 'متوفر' : 'In Stock'}
                              </span>
                            )}
                          </div>

                          <div className="flex gap-3">
                            {scannerResult.image ? (
                              <img 
                                src={scannerResult.image} 
                                alt={scannerResult.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center shrink-0">
                                <Package size={18} className="text-slate-400" />
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <h5 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{scannerResult.name}</h5>
                              <span className="text-[10px] text-slate-400 block font-mono">{scannerResult.partNumber}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-[10px] border-t border-slate-100 dark:border-slate-700/60 pt-3 text-right" dir="rtl">
                            <div>
                              <span className="text-slate-400 block font-bold">{language === 'ar' ? 'موقع الرف المستودعي:' : 'Warehouse Shelf:'}</span>
                              <strong className="text-slate-700 dark:text-slate-300 font-extrabold flex items-center gap-1 mt-0.5">
                                <MapPin size={10} className="text-indigo-550" />
                                <span>{scannerResult.shelfLocation || (language === 'ar' ? 'غير محدد' : 'Unspecified')}</span>
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">{language === 'ar' ? 'الكمية الدفترية الحالية:' : 'Current Book Quantity:'}</span>
                              <strong className="text-slate-700 dark:text-slate-300 font-extrabold block text-xs mt-0.5">
                                <span className="font-mono">{scannerResult.quantity}</span> {language === 'ar' ? 'وحدة' : 'units'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">{language === 'ar' ? 'الفئة والتوافق:' : 'Category & Vehicle:'}</span>
                              <strong className="text-slate-700 dark:text-slate-300 font-black block mt-0.5">
                                {scannerResult.category} • {scannerResult.compatibleVehicles?.[0] || 'Actros'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-bold">{language === 'ar' ? 'قيمة القطعة والعملة:' : 'Part Price Valuation:'}</span>
                              <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold block mt-0.5 font-mono">
                                {scannerResult.price || '0'} {language === 'ar' ? 'ر.س' : 'SAR'}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* Instant transaction action card */}
                        {user.role === 'viewer' ? (
                          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center space-y-1">
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">🔒 {language === 'ar' ? 'وضع العرض والمطابقة فقط' : 'View-Only Match Mode'}</span>
                            <p className="text-[9px] text-slate-400">
                              {language === 'ar' ? 'حسابك الحالي يمتلك صلاحية مشاهدة فقط، لتوريد أو صرف قطع الغيار يرجى تسجيل الدخول كمسؤول مخزن.' : 'Your account holds viewer rights. To issue or deposit, log in with Stock Manager privileges.'}
                            </p>
                          </div>
                        ) : (
                          <form onSubmit={handleScannerTxSubmit} className="p-4 bg-white dark:bg-slate-800 border border-slate-150 dark:border-slate-700/80 rounded-2xl shadow-sm space-y-3.5 text-right" dir="rtl">
                            <strong className="text-[10px] font-black text-slate-800 dark:text-slate-200 block">📝 {language === 'ar' ? 'تسجيل حركة مستودعية فورية:' : 'Record instant warehouse transaction:'}</strong>
                            
                            {/* Toggle Transaction Type */}
                            <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setScannerTxType('outgoing')}
                                className={`py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                                  scannerTxType === 'outgoing' 
                                    ? 'bg-rose-500 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                                }`}
                              >
                                <Minus size={11} />
                                <span>{language === 'ar' ? 'صرف (سحب قطعة)' : 'Issue (Withdraw)'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setScannerTxType('incoming')}
                                className={`py-2 rounded-lg text-[10px] font-black cursor-pointer transition-all flex items-center justify-center gap-1 ${
                                  scannerTxType === 'incoming' 
                                    ? 'bg-emerald-500 text-white shadow-xs' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-350'
                                }`}
                              >
                                <Plus size={11} />
                                <span>{language === 'ar' ? 'توريد (إضافة للمخزن)' : 'Deposit (Store)'}</span>
                              </button>
                            </div>

                            {/* Inputs: Quantity & Reason */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 block">{language === 'ar' ? 'الكمية الفورية' : 'Quantity'}</label>
                                <input 
                                  type="number"
                                  min="1"
                                  required
                                  value={scannerTxQty}
                                  onChange={(e) => setScannerTxQty(e.target.value)}
                                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-black dark:text-white outline-none"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <label className="text-[9px] font-black text-slate-400 block">{language === 'ar' ? 'سبب وصاحب الحركة (اختياري)' : 'Comment / Reason (Optional)'}</label>
                                <input 
                                  type="text"
                                  placeholder={scannerTxType === 'outgoing' ? (language === 'ar' ? 'شاحنة أكتروس رقم 4' : 'Rig Actros #4') : (language === 'ar' ? 'مورد بوش فرع الرياض' : 'Supplier Bosch Riyadh')}
                                  value={scannerTxReason}
                                  onChange={(e) => setScannerTxReason(e.target.value)}
                                  className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-xl text-xs font-bold dark:text-white outline-none"
                                />
                              </div>
                            </div>

                            {/* Action Button */}
                            <button
                              type="submit"
                              className={`w-full py-2.5 rounded-xl text-xs font-black text-white shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                                scannerTxType === 'outgoing' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'
                              }`}
                            >
                              <Check size={14} />
                              <span>
                                {scannerTxType === 'outgoing' 
                                  ? (language === 'ar' ? 'إتمام سحب وصرف القطعة من الرف' : 'Confirm Part Issuance')
                                  : (language === 'ar' ? 'إتمام توريد وحفظ القطعة بالرف' : 'Confirm Part Storage')
                                }
                              </span>
                            </button>
                          </form>
                        )}

                        {/* Extra Navigation and resetting */}
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSearchTerm(scannerResult.partNumber);
                              setIsScannerOpen(false);
                            }}
                            className="flex-1 py-2 bg-slate-100 hover:bg-slate-150 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 rounded-xl text-[10px] font-black cursor-pointer transition-colors"
                          >
                            {language === 'ar' ? 'تحديد وتصفية هذا الصنف بالقائمة' : 'Show and locate in stock list'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setScannerResult(null);
                            }}
                            className="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl text-[10px] font-black cursor-pointer transition-colors border border-indigo-200/20"
                          >
                            {language === 'ar' ? 'مسح رمز آخر' : 'Scan another'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-3 bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Search size={20} className="animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <strong className="text-xs font-black text-slate-700 dark:text-slate-300 block">
                            {language === 'ar' ? 'في انتظار قراءة الملصق أو الباركود' : 'Waiting for scanned label'}
                          </strong>
                          <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mx-auto">
                            {language === 'ar' 
                              ? 'وجه كاميرا هاتفك/جهازك نحو ملصق الباركود المطبوع على قطعة الغيار، أو اختر أحد أصناف المحاكاة السريعة من العمود الأيمن للاختبار اللحظي.' 
                              : 'Aim your camera viewport at any printed Code39 label, or click a simulated inventory item from the left panel to test.'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer close */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsScannerOpen(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer transition-colors"
                  >
                    {language === 'ar' ? 'إغلاق القارئ' : 'Close Reader'}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 1: ADD NEW PIECE ITEM --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsAddModalOpen(false)}
                className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-xs" 
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">تسجيل وتوريد قطعة للمستودع</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">اسم الصنف بالكامل</label>
                      <input 
                        type="text" 
                        required
                        placeholder="مثال: فلتر ديزل أكتروس مجمع"
                        value={newItem.name}
                        onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-500 block">الكود التسلسلي (Part No.)</label>
                        <button
                          type="button"
                          onClick={() => {
                            const code = generateSmartPartNumber(newItem.category);
                            setNewItem(prev => ({ ...prev, partNumber: code }));
                          }}
                          className="flex items-center gap-0.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          title="توليد كود باركود ذكي تلقائي للقطع التي ليس عليها باركود"
                        >
                          <Sparkles size={10} />
                          <span>توليد تلقائي ✨</span>
                        </button>
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="مثال: MB-32095-DSL"
                        value={newItem.partNumber}
                        onChange={(e) => setNewItem(prev => ({ ...prev, partNumber: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none text-left font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">فئة القطعة ميكانيكياً</label>
                      <select
                        value={newItem.category}
                        onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      >
                        <option value="فلاتر">فلاتر</option>
                        <option value="فرامل">فرامل</option>
                        <option value="إطارات">إطارات</option>
                        <option value="أقراص وزيوت">أقراص وزيوت</option>
                        <option value="هيدروليك">هيدروليك</option>
                        <option value="كهرباء">كهرباء</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">الرصيد الابتدائي</label>
                      <input 
                        type="number" 
                        required
                        placeholder="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">الحد الأدنى الآمن</label>
                      <input 
                        type="number" 
                        placeholder="5"
                        value={newItem.minQuantity}
                        onChange={(e) => setNewItem(prev => ({ ...prev, minQuantity: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">سعر الوحدة المعياري (ر.س)</label>
                      <input 
                        type="number" 
                        placeholder="مثال: 120"
                        value={newItem.price}
                        onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">رقم الرف والمستودع</label>
                      <input 
                        type="text" 
                        placeholder="مثال: أ-3 / رف 5"
                        value={newItem.shelfLocation}
                        onChange={(e) => setNewItem(prev => ({ ...prev, shelfLocation: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">الجهة الموردة أو الوكيل للاتصال</label>
                    <input 
                      type="text" 
                      placeholder="مثال: شركة الزاهد للتراكتورات"
                      value={newItem.supplier}
                      onChange={(e) => setNewItem(prev => ({ ...prev, supplier: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">المركبات شاحنات المتوافقة مع القطعة (تفصل بفاصلة ,)</label>
                    <input 
                      type="text" 
                      placeholder="تويوتا بيك أب - هايلوكس, شاحنة مرسيدس أكتروس"
                      value={newItem.compatibleVehicles}
                      onChange={(e) => setNewItem(prev => ({ ...prev, compatibleVehicles: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none lg:text-[11px]"
                    />
                  </div>

                  {/* Advanced Professional Logistics Fields */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-black text-slate-550 block border-b border-slate-100 dark:border-slate-800 pb-1">
                      📋 معايير إدارة المستودع الاحترافية (مدير المخزن)
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">الفرع / العلامة التجارية</label>
                        <input 
                          type="text" 
                          placeholder="مثال: Bosch, OEM, Denso"
                          value={newItem.brand}
                          onChange={(e) => setNewItem(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">رقم الـ SKU الخاص</label>
                        <input 
                          type="text" 
                          placeholder="مثال: SKU-88235-95"
                          value={newItem.sku}
                          onChange={(e) => setNewItem(prev => ({ ...prev, sku: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">حالة المنتج</label>
                        <select
                          value={newItem.condition}
                          onChange={(e) => setNewItem(prev => ({ ...prev, condition: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <option value="new">جديد أصلي</option>
                          <option value="used">مستعمل نظيف</option>
                          <option value="refurbished">مجدد معتمد</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">الوزن التقريبي</label>
                        <input 
                          type="text" 
                          placeholder="مثال: 1.5 كجم"
                          value={newItem.weight}
                          onChange={(e) => setNewItem(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-550 block">سعة علبة الكرتون</label>
                        <input 
                          type="number" 
                          placeholder="مثال: 10"
                          value={newItem.boxQuantity}
                          onChange={(e) => setNewItem(prev => ({ ...prev, boxQuantity: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-705 dark:text-slate-300 block">
                        {language === 'ar' ? 'صورة المعاينة الفنية للمنتج' : 'Product Technical Preview Image'}
                      </label>
                      
                      <div className="border border-dashed border-slate-350 dark:border-slate-700/85 bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl p-4 transition-all">
                        {newItem.image ? (
                          <div className="relative group rounded-xl overflow-hidden aspect-video max-w-xs mx-auto bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                            <img 
                              src={newItem.image} 
                              alt="Product technical preview" 
                              referrerPolicy="no-referrer"
                              className="object-contain w-full h-full max-h-40"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setNewItem(prev => ({ ...prev, image: '' }))}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-transform scale-90 hover:scale-100 cursor-pointer"
                              >
                                <Trash2 size={14} />
                                <span>{language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
                              <ImageIcon size={22} className="text-indigo-500" />
                            </div>
                            <p className="text-xs font-black text-slate-650 dark:text-slate-300 mb-1">
                              {language === 'ar' ? 'اسحب الصورة هنا أو اختر وسيلة التقاط/رفع' : 'Drag an image here or choose input type'}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3.5 font-bold">
                              {language === 'ar' ? 'يدعم الصور القياسية حتى 4 ميجابايت' : 'Supports standard image assets up to 4MB'}
                            </p>
                            
                            {/* Buttons for File Upload and Camera Capture */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                              {/* File input (Hidden) */}
                              <input 
                                type="file" 
                                id="file-upload-add" 
                                accept="image/*" 
                                onChange={(e) => handleImageFileChange(e, false)}
                                className="hidden" 
                              />
                              <label 
                                htmlFor="file-upload-add"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-755 dark:hover:bg-slate-750/70 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                <Upload size={14} className="text-violet-500" />
                                <span>{language === 'ar' ? 'رفع صورة من الجهاز' : 'Upload Image File'}</span>
                              </label>

                              {/* Camera Capture input (Hidden, native capture) */}
                              <input 
                                type="file" 
                                id="camera-capture-add" 
                                accept="image/*" 
                                capture="environment" 
                                onChange={(e) => handleImageFileChange(e, false)}
                                className="hidden" 
                              />
                              <label 
                                htmlFor="camera-capture-add"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-55/60 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                <Camera size={14} className="text-indigo-550" />
                                <span>{language === 'ar' ? 'التقاط فوري بالكاميرا 📷' : 'Shoot Live Photo 📷'}</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Manual URL Paste Accordion */}
                        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                          <details className="group">
                            <summary className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase cursor-pointer list-none flex items-center gap-1 hover:text-indigo-500 select-none">
                              <span className="text-slate-400 group-open:rotate-90 transition-transform">▸</span>
                              <span>{language === 'ar' ? 'أو أدخل رابط ويب خارجي يدوياً' : 'Or enter a manual web hyperlink'}</span>
                            </summary>
                            <div className="mt-2 text-right">
                              <input 
                                type="text" 
                                placeholder={language === 'ar' ? "مثال: https://images.unsplash.com/photo-..." : "e.g., https://images.unsplash.com/..."}
                                value={newItem.image}
                                onChange={(e) => setNewItem(prev => ({ ...prev, image: e.target.value }))}
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                              />
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-550 block">ملاحظات مدير المخزن ومواصفات السعة</label>
                      <textarea 
                        rows={2}
                        placeholder="ملاحظات الحفظ، شروط درجات الحرارة أو تفاصيل أخرى فنية..."
                        value={newItem.managerNotes}
                        onChange={(e) => setNewItem(prev => ({ ...prev, managerNotes: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    تثبيت الصنف في سجلات ومصنفات المستودع
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL FOR EDITING SPARE PARTS INVENTORY ITEM --- */}
      <AnimatePresence>
        {isEditModalOpen && selectedItemForEdit && (
          <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => { setIsEditModalOpen(false); setSelectedItemForEdit(null); }}
                className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-xs" 
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">تعديل مواصفات وبيانات قطعة الغيار الفنية</h3>
                  <button onClick={() => { setIsEditModalOpen(false); setSelectedItemForEdit(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleEditItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">اسم الصنف بالكامل</label>
                      <input 
                        type="text" 
                        required
                        value={editItemState.name || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">الكود التسلسلي (Part No.)</label>
                      <input 
                        type="text" 
                        required
                        value={editItemState.partNumber || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, partNumber: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none text-left font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">فئة القطعة ميكانيكياً</label>
                      <select
                        value={editItemState.category || 'أخرى'}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      >
                        <option value="فلاتر">فلاتر</option>
                        <option value="فرامل">فرامل</option>
                        <option value="إطارات">إطارات</option>
                        <option value="أقراص وزيوت">أقراص وزيوت</option>
                        <option value="هيدروليك">هيدروليك</option>
                        <option value="كهرباء">كهرباء</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">الحد الأدنى الآمن</label>
                      <input 
                        type="number" 
                        placeholder="5"
                        value={editItemState.minQuantity || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, minQuantity: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">سعر الوحدة المعياري (ر.س)</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={editItemState.price !== undefined ? editItemState.price : ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">رقم الرف والمستودع</label>
                      <input 
                        type="text" 
                        value={editItemState.shelfLocation || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, shelfLocation: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 block">الجهة الموردة أو الوكيل</label>
                      <input 
                        type="text" 
                        value={editItemState.supplier || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, supplier: e.target.value }))}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">المركبات شاحنات المتوافقة (تفصل بفاصلة ,)</label>
                    <input 
                      type="text" 
                      value={editItemState.compatibleVehicles || ''}
                      onChange={(e) => setEditItemState(prev => ({ ...prev, compatibleVehicles: e.target.value }))}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                    />
                  </div>

                  {/* Enhanced Fields for Professional editing */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-250 dark:border-slate-800 space-y-3">
                    <span className="text-[10px] font-black text-indigo-550 block border-b border-slate-100 dark:border-slate-800 pb-1">
                      🔧 تفاصيل فنية متقدمة للوجستيات والمطابقة (مدير المخزن)
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 block">العلامة التجارية / الماركة</label>
                        <input 
                          type="text" 
                          placeholder="Bosch, OEM, Denso"
                          value={editItemState.brand || ''}
                          onChange={(e) => setEditItemState(prev => ({ ...prev, brand: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 block">كود الـ SKU الفردي</label>
                        <input 
                          type="text" 
                          placeholder="SKU-88235-95"
                          value={editItemState.sku || ''}
                          onChange={(e) => setEditItemState(prev => ({ ...prev, sku: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 block">الحالة التشغيلية</label>
                        <select
                          value={editItemState.condition || 'new'}
                          onChange={(e) => setEditItemState(prev => ({ ...prev, condition: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        >
                          <option value="new">جديد أصلي</option>
                          <option value="used">مستعمل نظيف</option>
                          <option value="refurbished">مجدد معتمد</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 block">الوزن الكلي</label>
                        <input 
                          type="text" 
                          placeholder="1.5 كجم"
                          value={editItemState.weight || ''}
                          onChange={(e) => setEditItemState(prev => ({ ...prev, weight: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 block">سعة علبة التغليف</label>
                        <input 
                          type="number" 
                          placeholder="10"
                          value={editItemState.boxQuantity || ''}
                          onChange={(e) => setEditItemState(prev => ({ ...prev, boxQuantity: e.target.value }))}
                          className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-705 dark:text-slate-300 block">
                        {language === 'ar' ? 'صورة المعاينة الفنية للمنتج' : 'Product Technical Preview Image'}
                      </label>
                      
                      <div className="border border-dashed border-slate-350 dark:border-slate-700/85 bg-slate-50/70 dark:bg-slate-900/50 rounded-2xl p-4 transition-all">
                        {editItemState.image ? (
                          <div className="relative group rounded-xl overflow-hidden aspect-video max-w-xs mx-auto bg-slate-100 dark:bg-slate-850 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                            <img 
                              src={editItemState.image} 
                              alt="Product technical preview" 
                              referrerPolicy="no-referrer"
                              className="object-contain w-full h-full max-h-40"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditItemState(prev => ({ ...prev, image: '' }))}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-transform scale-90 hover:scale-100 cursor-pointer"
                              >
                                <Trash2 size={14} />
                                <span>{language === 'ar' ? 'إزالة الصورة' : 'Remove Image'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-4 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-xs">
                              <ImageIcon size={22} className="text-indigo-500" />
                            </div>
                            <p className="text-xs font-black text-slate-650 dark:text-slate-300 mb-1">
                              {language === 'ar' ? 'اسحب الصورة هنا أو اختر وسيلة التقاط/رفع' : 'Drag an image here or choose input type'}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3.5 font-bold">
                              {language === 'ar' ? 'يدعم الصور القياسية حتى 4 ميجابايت' : 'Supports standard image assets up to 4MB'}
                            </p>
                            
                            {/* Buttons for File Upload and Camera Capture */}
                            <div className="flex flex-wrap items-center justify-center gap-2.5">
                              {/* File input (Hidden) */}
                              <input 
                                type="file" 
                                id="file-upload-edit" 
                                accept="image/*" 
                                onChange={(e) => handleImageFileChange(e, true)}
                                className="hidden" 
                              />
                              <label 
                                htmlFor="file-upload-edit"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-755 dark:hover:bg-slate-750/70 hover:border-slate-300 dark:hover:border-slate-600 shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                <Upload size={14} className="text-violet-500" />
                                <span>{language === 'ar' ? 'رفع صورة من الجهاز' : 'Upload Image File'}</span>
                              </label>

                              {/* Camera Capture input (Hidden, native capture) */}
                              <input 
                                type="file" 
                                id="camera-capture-edit" 
                                accept="image/*" 
                                capture="environment" 
                                onChange={(e) => handleImageFileChange(e, true)}
                                className="hidden" 
                              />
                              <label 
                                htmlFor="camera-capture-edit"
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-55/60 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 border border-indigo-100 dark:border-indigo-900/40 rounded-xl text-xs font-black text-indigo-600 dark:text-indigo-400 shadow-xs cursor-pointer transition-all active:scale-95"
                              >
                                <Camera size={14} className="text-indigo-550" />
                                <span>{language === 'ar' ? 'التقاط فوري بالكاميرا 📷' : 'Shoot Live Photo 📷'}</span>
                              </label>
                            </div>
                          </div>
                        )}

                        {/* Manual URL Paste Accordion */}
                        <div className="mt-3 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                          <details className="group">
                            <summary className="text-[10px] font-black tracking-wider text-slate-500 dark:text-slate-400 uppercase cursor-pointer list-none flex items-center gap-1 hover:text-indigo-500 select-none">
                              <span className="text-slate-400 group-open:rotate-90 transition-transform">▸</span>
                              <span>{language === 'ar' ? 'أو أدخل رابط ويب خارجي يدوياً' : 'Or enter a manual web hyperlink'}</span>
                            </summary>
                            <div className="mt-2 text-right">
                              <input 
                                type="text" 
                                placeholder={language === 'ar' ? "مثال: https://images.unsplash.com/photo-..." : "e.g., https://images.unsplash.com/..."}
                                value={editItemState.image || ''}
                                onChange={(e) => setEditItemState(prev => ({ ...prev, image: e.target.value }))}
                                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                              />
                            </div>
                          </details>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 block">ملاحظات وتحذيرات مخزنية</label>
                      <textarea 
                        rows={2}
                        placeholder="تحذيرات الرطوبة، شروط الأمان، تفاصيل ميكانيكية خاصة..."
                        value={editItemState.managerNotes || ''}
                        onChange={(e) => setEditItemState(prev => ({ ...prev, managerNotes: e.target.value }))}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    حفظ التغييرات وتعميم التحديث الفني للقطعة
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: INCOMING / OUTGOING MOVE TRANSACTION --- */}
      <AnimatePresence>
        {isTxModalOpen && selectedItemForTx && (
          <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => { setIsTxModalOpen(false); setSelectedItemForTx(null); }}
                className="fixed inset-0 transition-opacity bg-slate-900/40 backdrop-blur-xs" 
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative z-10 inline-block w-full max-w-md p-6 my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-slate-800 shadow-xl rounded-2xl border border-slate-100 dark:border-slate-700"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 mb-4">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">إجراء حركة لمستند مخزون</h3>
                    <span className="text-[10px] text-indigo-600 font-bold">{selectedItemForTx.name} ({selectedItemForTx.partNumber})</span>
                  </div>
                  <button onClick={() => { setIsTxModalOpen(false); setSelectedItemForTx(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleTxSubmit} className="space-y-4">
                  
                  {/* Tx Type selectors */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setTxType('incoming')}
                      className={`py-2 text-xs font-black rounded-lg transition-all text-center cursor-pointer ${
                        txType === 'incoming' 
                          ? 'bg-emerald-500 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-755'
                      }`}
                    >
                      شحن وتوريد (+ مدخل)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('outgoing')}
                      className={`py-2 text-xs font-black rounded-lg transition-all text-center cursor-pointer ${
                        txType === 'outgoing' 
                          ? 'bg-rose-500 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-755'
                      }`}
                    >
                      سحب تشغيلي (- مخرج)
                    </button>
                  </div>

                  {/* Qty field */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-500 block">الكمية المسجلة بالحركة</label>
                      <span className="text-[10px] text-slate-400 font-bold">الرصيد الكلي الحالي: {selectedItemForTx.quantity} قطعة</span>
                    </div>
                    <input 
                      type="number" 
                      required
                      min="1"
                      placeholder="مثال: 5"
                      value={txQty}
                      onChange={(e) => setTxQty(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none"
                    />
                  </div>

                  {/* Reason field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 block">موجبات الحركة أو السبب (الأمر الفني للسيارة)</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="مثال: لصرف الفلتر كجزء من الصيانة الدورية في ورشة الميكانك المركزي للشاحنة أكتروس..."
                      value={txReason}
                      onChange={(e) => setTxReason(e.target.value)}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white outline-none resize-none leading-normal"
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 text-white rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer ${
                      txType === 'incoming' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    تثبيت وترحيل الحركة فورياً لمستند الجودة
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL 3: BARCODE PRINT STATION & STICKER BUILDER --- */}
      <AnimatePresence>
        {isBulkPrintModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 text-center">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setIsBulkPrintModalOpen(false)}
                className="fixed inset-0 transition-opacity bg-slate-950/70 backdrop-blur-xs" 
              />

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 15 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.96 }}
                className="relative z-10 inline-block w-full max-w-6xl my-8 overflow-hidden text-right align-middle transition-all transform bg-white dark:bg-[#0f1422] shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800"
              >
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Printer size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">محطة ملصقات الباركود المتكاملة</h3>
                      <p className="text-[10px] text-slate-500">طباعة ملصقات الرفوف والأصناف بأي كمية على ورق اللاصق العادي A4 أو طابعات رول الباركود المتخصصة.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsBulkPrintModalOpen(false)} 
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 rounded-lg cursor-pointer transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Modal Workspace Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-100 dark:divide-slate-800">
                  
                  {/* LEFT PANE: CONFIGURATIONS & PRINT QUEUE */}
                  <div className="lg:col-span-4 p-5 overflow-y-auto max-h-[72vh] space-y-5">
                    
                    {/* Choose Preset Card */}
                    <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">1. نوع ورق الطباعة وتخطيط الملصقات</span>
                      
                      <select
                        value={selectedLayout}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setSelectedLayout(val);
                          // Automatically set fitting columns
                          if (val === 'sheet-24') setPrintColumns(3);
                          else if (val === 'sheet-40') setPrintColumns(4);
                          else if (val === 'sheet-50') setPrintColumns(5);
                          else setPrintColumns(1);
                        }}
                        className="w-full p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black dark:text-white outline-none cursor-pointer"
                      >
                        <option value="sheet-24">ورق ملصقات A4 متوازي (24 ملصق بالورقة - 3 أعمدة × 8 صفوف) - مثالي!</option>
                        <option value="sheet-40">ورق ملصقات A4 عالي الكثافة (40 ملصق - 4 أعمدة × 10 صفوف)</option>
                        <option value="sheet-50">ورق ملصقات A4 مجهري مغلق (50 ملصق - 5 أعمدة × 10 صفوف)</option>
                        <option value="thermal-roll">طابعة الباركود الحرارية الصغيرة (بكرة لاصقة - مخرج صف واحد مستمر)</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                        <div className="bg-white dark:bg-slate-950/40 p-1.5 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                          <span className="block text-slate-400">عدد الأعمدة بالصف:</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 font-mono text-xs">{printColumns} أعمدة</span>
                        </div>
                        <div className="bg-white dark:bg-slate-950/40 p-1.5 rounded-lg text-center border border-slate-100 dark:border-slate-800">
                          <span className="block text-slate-400">نمط التخطيط فني:</span>
                          <span className="font-extrabold text-slate-800 dark:text-slate-200 text-[9px]">
                            {selectedLayout.startsWith('sheet') ? 'أوراق لاصقة A4 مكتبية' : 'بكرة حرارية مستمرة'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calibration sliders to prevent tearing and small sizes */}
                    <div className="space-y-4 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 block">2. معايرة حجم وهوامش ملصق الباركود</span>
                      
                      {/* Barcode scale */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>طول الباركود وارتفاعه العمودي:</span>
                          <span className="font-mono text-indigo-650">{barcodeScale} بكسل</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="80"
                          value={barcodeScale}
                          onChange={(e) => setBarcodeScale(Number(e.target.value))}
                          className="w-full accent-indigo-650"
                        />
                      </div>

                      {/* Spacer scale */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>الهوامش والفواصل الداخلية للملصق:</span>
                          <span className="font-mono text-indigo-650">{labelSpacer} بكسل</span>
                        </div>
                        <input
                          type="range"
                          min="4"
                          max="24"
                          value={labelSpacer}
                          onChange={(e) => setLabelSpacer(Number(e.target.value))}
                          className="w-full accent-indigo-650"
                        />
                      </div>

                      {/* Border guides indicator */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={labelBorder}
                          onChange={(e) => setLabelBorder(e.target.checked)}
                          className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-450">إظهار إطار تنقيط هادئ لقص الحواف (Dotted Borders)</span>
                      </label>
                    </div>

                    {/* Print queue item rows */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">3. الأصناف المطلوبة للطباعة</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('هل أنت متأكد من تصفير كافة الأصناف المضافة لطابور الطباعة حالياً؟')) {
                                setPrintQueue([]);
                              }
                            }}
                            className="text-[9px] font-black text-rose-500 hover:underline cursor-pointer"
                          >
                            تفريغ الطابور 🗑️
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              // Fill matching current stock deficit or all
                              const toAdd = items.map(it => ({ item: it, copies: 1 }));
                              setPrintQueue(toAdd);
                              alert('تم تعبئة طابور الطباعة بكافة الأصناف المسجلة في الرفوف (بواقع ملصق واحد لكل صنف).');
                            }}
                            className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                          >
                            تعبئة الكل ➕
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
                        {printQueue.map((queueItem) => (
                          <div 
                            key={queueItem.item.id}
                            className="p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-[11px] font-bold"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <span className="block text-slate-900 dark:text-white truncate" title={queueItem.item.name}>
                                {queueItem.item.name}
                              </span>
                              <span className="block text-[9px] text-slate-400 font-mono">{queueItem.item.partNumber}</span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {/* Quantity modifications */}
                              <div className="flex items-center gap-1 bg-white dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintQueue(prev => prev.map(q => q.item.id === queueItem.item.id ? { ...q, copies: Math.max(1, q.copies - 1) } : q));
                                  }}
                                  className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="font-mono text-slate-800 dark:text-slate-200 px-1 text-center min-w-[20px]">{queueItem.copies}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPrintQueue(prev => prev.map(q => q.item.id === queueItem.item.id ? { ...q, copies: q.copies + 1 } : q));
                                  }}
                                  className="w-4 h-4 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-emerald-500 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setPrintQueue(prev => prev.filter(q => q.item.id !== queueItem.item.id));
                                }}
                                className="p-1 bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer transition-colors"
                                title="إزالة من الطابور"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        ))}

                        {printQueue.length === 0 && (
                          <div className="text-center py-6 text-slate-400 font-bold text-[10px]">
                            طابور ملصقات الطباعة فارغ حالاً.<br />
                            قم بالنقر على "إضافة للطباعة" بجانب أي قطعة في الخلفية.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Printer action triggers and warning */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-right space-y-3">
                      <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 text-[10px] text-amber-800 dark:text-amber-400 rounded-xl leading-normal border border-amber-200/20">
                        ⚠️ <span className="font-extrabold text-amber-900 dark:text-amber-300">ملاحظة كبراء للمعايرة فنيّاً:</span> عند ظهور شاشة طباعة المتصفح، قم بتحديد حجم ورقة الطباعة <span className="font-black">A4</span> واجعل خيار الهوامش <span className="font-bold">"بلا هوامش" (Margins: None)</span> للحصول على محاذاة فيزيائية مثالية 100% لخلايا المربعات على الألواح اللاصقة.
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setIsBulkPrintModalOpen(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer w-1/3 transition-colors"
                        >
                          إغلاق النافذة
                        </button>
                        
                        <button
                          type="button"
                          disabled={printQueue.length === 0}
                          onClick={() => window.print()}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-850 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>إرسال لملف وأمر الطباعة الفوري</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* RIGHT PANE: LIVE STICKER GRID PREVIEW & PHYSICAL SHEET SIMULATOR */}
                  <div className="lg:col-span-8 p-5 bg-slate-100/50 dark:bg-slate-900/60 flex flex-col items-center max-h-[72vh] overflow-y-auto">
                    <span className="text-[11px] font-black text-slate-500 self-start mb-3">4. المعاينة المباشرة لصحيفة الطباعة (Live Interactive Sheet Preview)</span>
                    
                    {/* Live printable area */}
                    <div 
                      id="print-area"
                      className="bg-white text-black p-4 shadow-inner rounded-xl w-full border border-slate-200 min-h-[60vh] flex flex-col items-center"
                      style={{
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {printQueue.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 font-bold space-y-2">
                          <Printer size={32} className="stroke-[1.5]" />
                          <span>يرجى اختيار قطع وإضافتها لطابور الطباعة للبدء بالمعاينة والتخصيص</span>
                        </div>
                      ) : (
                        <div 
                          className={`w-full ${
                            selectedLayout === 'sheet-24' ? 'print-grid-24 grid grid-cols-3' : 
                            selectedLayout === 'sheet-40' ? 'print-grid-40 grid grid-cols-4' : 
                            selectedLayout === 'sheet-50' ? 'print-grid-50 grid grid-cols-5' : 
                            'print-grid-thermal flex flex-col items-center gap-6'
                          }`}
                          style={{
                            gap: `${labelSpacer}px`,
                          }}
                        >
                          {/* Multiply matching each copy selection count */}
                          {printQueue.flatMap((queueItem) => 
                            Array.from({ length: queueItem.copies }).map((_, copyIndex) => (
                              <div
                                key={`${queueItem.item.id}-${copyIndex}`}
                                className={`print-sticker bg-white text-black text-right p-2 flex flex-col justify-between ${
                                  labelBorder ? 'border border-dashed border-slate-300' : 'border border-transparent'
                                }`}
                                style={{
                                  borderRadius: '6px',
                                  pageBreakInside: 'avoid',
                                  breakInside: 'avoid',
                                  minHeight: selectedLayout === 'thermal-roll' ? '120px' : '90px',
                                  width: selectedLayout === 'thermal-roll' ? '65%' : 'auto',
                                }}
                              >
                                {/* Header category */}
                                <div className="flex items-center justify-between text-[8px] border-b border-slate-100 pb-1 mb-1 font-black">
                                  <span className="bg-slate-100 text-slate-800 px-1 py-0.2 rounded">
                                    {queueItem.item.category}
                                  </span>
                                  <span className="text-slate-400">
                                    أصل مستودعي
                                  </span>
                                </div>

                                {/* Body Text */}
                                <div className="space-y-0.5 text-right flex-1">
                                  <h4 className="text-[10px] font-black text-slate-900 leading-tight block truncate">
                                    {queueItem.item.name}
                                  </h4>
                                  <div className="flex items-center justify-between text-[8px] text-slate-550 font-medium">
                                    <span>الرمز الفني:</span>
                                    <span className="font-mono font-bold text-slate-800">{queueItem.item.partNumber}</span>
                                  </div>
                                </div>

                                {/* Code 39 Vector Perfect Barcode visual */}
                                <div className="my-1.5 flex justify-center items-center bg-white p-0.5">
                                  <Barcode 
                                    val={queueItem.item.partNumber} 
                                    height={barcodeScale} 
                                    showText={false} 
                                  />
                                </div>

                                {/* Footer Storage metadata */}
                                <div className="flex items-center justify-between text-[8px] bg-slate-50 p-1.5 rounded border border-slate-100 mt-1">
                                  <span className="font-bold text-slate-700 flex items-center gap-0.5">
                                    📍 الرفّ: {queueItem.item.shelfLocation || 'غير محدد'}
                                  </span>
                                  {queueItem.item.price && (
                                    <span className="font-mono font-extrabold text-slate-900">
                                      {queueItem.item.price} ر.س
                                    </span>
                                  )}
                                </div>

                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PRINT SHEET HELPER DIRECT MEDIA SYLES --- */}
      {printQueue.length > 0 && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            /* Full blank slate except custom sheet */
            body * {
              visibility: hidden !important;
              background-color: transparent !important;
              background-image: none !important;
              color: black !important;
              box-shadow: none !important;
            }
            #print-area, #print-area * {
              visibility: visible !important;
            }
            #print-area {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0px !important;
              border: none !important;
              background: white !important;
            }
            /* Specific grids specifications matching layout */
            .print-grid-24 {
              display: grid !important;
              grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
              gap: ${labelSpacer}px !important;
              width: 100% !important;
            }
            .print-grid-40 {
              display: grid !important;
              grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
              gap: ${labelSpacer}px !important;
              width: 100% !important;
            }
            .print-grid-50 {
              display: grid !important;
              grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
              gap: ${labelSpacer}px !important;
              width: 100% !important;
            }
            .print-grid-thermal {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              gap: 20px !important;
              width: 100% !important;
            }
            .print-sticker {
              background: white !important;
              color: black !important;
              border: ${labelBorder ? '1px dashed #d1d5db' : 'none'} !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 0 !important;
            }
          }
        `}} />
      )}

    </div>
  );
}
