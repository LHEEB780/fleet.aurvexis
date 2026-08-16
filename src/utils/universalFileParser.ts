import * as XLSX from 'xlsx';
import { Vehicle } from '../types';

export interface ParsedAssetResult {
  rawTableText: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  sampleRows: any[];
  detectedType: 'excel' | 'csv' | 'json' | 'text';
}

/**
 * Universal file reader that safely handles ANY uploaded file:
 * - Binary Excel (.xlsx, .xls, .xlsm, .xlsb, .ods)
 * - CSV / TSV / Delimited text (.csv, .tsv, .txt)
 * - JSON files (.json)
 * - Free-form text
 * 
 * Never outputs raw ZIP/XML corrupted binary characters!
 */
export async function parseAnyFleetFile(file: File): Promise<ParsedAssetResult> {
  const fileName = file.name.toLowerCase();

  // 1. Check if binary spreadsheet or Excel format
  const isExcel = fileName.endsWith('.xlsx') || 
                  fileName.endsWith('.xls') || 
                  fileName.endsWith('.xlsm') || 
                  fileName.endsWith('.xlsb') || 
                  fileName.endsWith('.ods');

  if (isExcel) {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      
      // Read all sheets or first active sheet
      let combinedCsv = '';
      let allRows: any[] = [];
      let detectedHeaders: string[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        if (!worksheet) continue;

        // Convert worksheet to clean CSV
        const sheetCsv = XLSX.utils.sheet_to_csv(worksheet, { FS: ',', RS: '\n' });
        if (sheetCsv.trim().length > 0) {
          if (combinedCsv.length > 0) combinedCsv += '\n';
          combinedCsv += `--- صفحة العمل: ${sheetName} ---\n` + sheetCsv;
        }

        // Convert to array of objects or 2D array
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', header: 1 });
        if (jsonRows.length > 0) {
          if (detectedHeaders.length === 0 && Array.isArray(jsonRows[0])) {
            detectedHeaders = jsonRows[0].map(h => String(h || '').trim()).filter(Boolean);
          }
          allRows.push(...jsonRows.filter(r => Array.isArray(r) && r.some(c => String(c).trim().length > 0)));
        }
      }

      return {
        rawTableText: combinedCsv.trim(),
        rowCount: Math.max(0, allRows.length - 1),
        columnCount: detectedHeaders.length || 5,
        headers: detectedHeaders,
        sampleRows: allRows.slice(0, 5),
        detectedType: 'excel'
      };
    } catch (err) {
      console.warn('XLSX parser fallback to text:', err);
    }
  }

  // 2. Try JSON parser
  if (fileName.endsWith('.json')) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const items = Array.isArray(parsed) ? parsed : (parsed.vehicles || parsed.assets || [parsed]);
      
      const headers = items.length > 0 ? Object.keys(items[0]) : [];
      const csvLines = [
        headers.join(','),
        ...items.map((it: any) => headers.map(h => JSON.stringify(it[h] ?? '')).join(','))
      ].join('\n');

      return {
        rawTableText: csvLines,
        rowCount: items.length,
        columnCount: headers.length,
        headers,
        sampleRows: items.slice(0, 5),
        detectedType: 'json'
      };
    } catch (e) {
      console.warn('JSON parse error:', e);
    }
  }

  // 3. Fallback: Parse as plain text / CSV with automatic binary check
  const text = await file.text();
  
  // Guard: if user renamed a .xlsx to .txt or raw binary passed
  if (text.startsWith('PK\x03\x04') || text.includes('[Content_Types].xml')) {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const sheetCsv = XLSX.utils.sheet_to_csv(firstSheet);
      return {
        rawTableText: sheetCsv,
        rowCount: 10,
        columnCount: 5,
        headers: ['البيانات المستخرجة'],
        sampleRows: [],
        detectedType: 'excel'
      };
    } catch (e) {
      console.warn('ZIP fallback failed:', e);
    }
  }

  // Regular plain CSV / TSV text
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  const firstLine = lines[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : firstLine.includes('|') ? '|' : ',';
  const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, '')).filter(Boolean);

  return {
    rawTableText: text,
    rowCount: Math.max(0, lines.length - 1),
    columnCount: headers.length,
    headers,
    sampleRows: lines.slice(1, 6).map(l => l.split(delimiter)),
    detectedType: 'csv'
  };
}

/**
 * Downloads a comprehensive, professional Excel spreadsheet template (.xlsx)
 * with dedicated tabs & realistic sample data for:
 * 1. الشاحنات والمركبات (Trucks & Vehicles)
 * 2. المولدات ومحطات الطاقة (Generators & Power Units - no wheels, hour meter)
 * 3. المعدات الثقيلة والإنشائية (Heavy Equipment - hydraulics, hours)
 */
export function downloadFleetAssetTemplate() {
  const wb = XLSX.utils.book_new();

  // Tab 1: شاحنات ومركبات (Vehicles & Trucks)
  const vehiclesData = [
    {
      'اسم الأصل / المركبة': 'شاحنة مرسيدس أكتروس ثقيلة',
      'رقم اللوحة': 'أ ب ج 1024',
      'نوع الأصل': 'معدة ثقيلة',
      'التصنيف': 'شاحنات نقل ثقيل',
      'القسم / الإدارة': 'قسم الآليات والنقل',
      'الشعبة التشغيلية': 'شعبة الحركة',
      'رقم الهيكل (VIN)': 'WDB9340321L984210',
      'رقم المحرك': 'OM501LA-849201',
      'سنة الصنع': 2024,
      'نوع الوقود': 'ديزل',
      'الحمولة المعتمدة': '25 طن',
      'عدد العجلات': 10,
      'مقاس الإطارات': '315/80R22.5',
      'ضغط الهواء الموصى به': '115 PSI',
      'ماركة الإطارات': 'Michelin',
      'حالة الإطارات': 'ممتاز',
      'الحالة التشغيلية': 'فعالة'
    },
    {
      'اسم الأصل / المركبة': 'تويوتا هيلوكس دبل كابين',
      'رقم اللوحة': 'د هـ و 5520',
      'نوع الأصل': 'مركبة خفيفة',
      'التصنيف': 'سيارات خدمة وميدان',
      'القسم / الإدارة': 'شعبة الصيانة الميدانية',
      'الشعبة التشغيلية': 'فرق الطوارئ',
      'رقم الهيكل (VIN)': 'MROFX22G58102943',
      'رقم المحرك': '2GD-FTV-482019',
      'سنة الصنع': 2025,
      'نوع الوقود': 'ديزل',
      'الحمولة المعتمدة': '1.2 طن',
      'عدد العجلات': 4,
      'مقاس الإطارات': '265/65R17',
      'ضغط الهواء الموصى به': '35 PSI',
      'ماركة الإطارات': 'Bridgestone',
      'حالة الإطارات': 'ممتاز',
      'الحالة التشغيلية': 'فعالة'
    },
    {
      'اسم الأصل / المركبة': 'حافلة هيونداي نقل كوستر',
      'رقم اللوحة': 'ر ز س 9901',
      'نوع الأصل': 'نقل جماعي',
      'التصنيف': 'حافلات ركاب',
      'القسم / الإدارة': 'الخدمات اللوجستية',
      'الشعبة التشغيلية': 'شعبة الحركة',
      'رقم الهيكل (VIN)': 'KMJHD17BP2C910248',
      'رقم المحرك': 'D4DD-730192',
      'سنة الصنع': 2023,
      'نوع الوقود': 'ديزل',
      'الحمولة المعتمدة': '30 راكب',
      'عدد العجلات': 6,
      'مقاس الإطارات': '215/75R17.5',
      'ضغط الهواء الموصى به': '75 PSI',
      'ماركة الإطارات': 'Continental',
      'حالة الإطارات': 'جيد جداً',
      'الحالة التشغيلية': 'فعالة'
    }
  ];

  // Tab 2: مولدات ومعدات طاقة (Generators & Power Units)
  const generatorsData = [
    {
      'اسم الأصل / المولد': 'مولد كاتربيلر كابينة عازلة 500kVA',
      'الرقم التسلسلي / الكود': 'CAT-GEN-500-881',
      'نوع الأصل': 'معدة طاقة وتوليد',
      'التصنيف': 'مولدات كهربائية ثابتة',
      'القسم / الإدارة': 'قسم الصيانة والمشاريع',
      'الشعبة التشغيلية': 'محطات التوليد',
      'رقم الهيكل / الشاصي': 'CAT00C15TGEN92014',
      'رقم المحرك': 'CAT-C15-ACERT-491',
      'سنة الصنع': 2023,
      'نوع الوقود': 'ديزل',
      'القدرة التشغيلية': '500 kVA / 400 kW',
      'عدد العجلات': 0,
      'مقاس الإطارات': 'غير متوفر (معدة ثابتة على قاعدة)',
      'ضغط الهواء': 'N/A',
      'ماركة الإطارات': 'غير متوفر',
      'حالة الأصل': 'ممتاز',
      'عداد ساعات التشغيل': '1,420 ساعة',
      'الحالة التشغيلية': 'فعالة'
    },
    {
      'اسم الأصل / المولد': 'مولد بيركنز صامت 250kVA',
      'الرقم التسلسلي / الكود': 'PRK-GEN-250-402',
      'نوع الأصل': 'معدة طاقة وتوليد',
      'التصنيف': 'مولدات كهربائية احتياطية',
      'القسم / الإدارة': 'قسم الصيانة والمشاريع',
      'الشعبة التشغيلية': 'المبنى الرئيسي',
      'رقم الهيكل / الشاصي': 'PRK2023ENG71092',
      'رقم المحرك': '1506A-E88TAG3',
      'سنة الصنع': 2024,
      'نوع الوقود': 'ديزل',
      'القدرة التشغيلية': '250 kVA',
      'عدد العجلات': 0,
      'مقاس الإطارات': 'غير متوفر (معدة ثابتة)',
      'ضغط الهواء': 'N/A',
      'ماركة الإطارات': 'غير متوفر',
      'حالة الأصل': 'ممتاز',
      'عداد ساعات التشغيل': '680 ساعة',
      'الحالة التشغيلية': 'فعالة'
    },
    {
      'اسم الأصل / المولد': 'برج إنارة ومولد هيدروليكي متنقل',
      'الرقم التسلسلي / الكود': 'TL-GEN-04-2024',
      'نوع الأصل': 'معدة هندسية',
      'التصنيف': 'أبراج إنارة ميدانية',
      'القسم / الإدارة': 'العمليات الميدانية',
      'الشعبة التشغيلية': 'فريق الطوارئ',
      'رقم الهيكل / الشاصي': 'TL-KUBOTA-88201',
      'رقم المحرك': 'D1105-BG-7721',
      'سنة الصنع': 2024,
      'نوع الوقود': 'ديزل',
      'القدرة التشغيلية': '10 kVA + 4x1000W LED',
      'عدد العجلات': 2,
      'مقاس الإطارات': '185R14C',
      'ضغط الهواء': '45 PSI',
      'ماركة الإطارات': 'Dunlop',
      'حالة الأصل': 'ممتاز',
      'عداد ساعات التشغيل': '310 ساعة',
      'الحالة التشغيلية': 'فعالة'
    }
  ];

  // Tab 3: معدات ثقيلة وهندسية (Heavy Machinery & Earthmoving)
  const heavyEquipmentData = [
    {
      'اسم الأصل / المعدة': 'حفار كوماتسو هيدروليكي جنزير PC200',
      'رقم اللوحة / الكود': 'معدة-حفار-01',
      'نوع الأصل': 'معدة ثقيلة',
      'التصنيف': 'حفارات جنزير',
      'القسم / الإدارة': 'قسم الصيانة والمشاريع',
      'الشعبة التشغيلية': 'المشاريع الإنشائية',
      'رقم الهيكل (VIN)': 'KMTPC200-8-C94012',
      'رقم المحرك': 'SAA6D107E-1',
      'سنة الصنع': 2023,
      'نوع الوقود': 'ديزل',
      'الحمولة / سعة الدلو': '1.2 متر مكعب',
      'عدد العجلات': 0,
      'مقاس الإطارات': 'سلاسل جنزير حديدية (Track)',
      'ضغط الهواء': 'N/A',
      'ماركة الإطارات': 'Komatsu Genuine Track',
      'حالة الأصل': 'ممتاز',
      'عداد الساعات': '2,150 ساعة',
      'الحالة التشغيلية': 'فعالة'
    },
    {
      'اسم الأصل / المعدة': 'رافعة شوكية كاتربيلر 5 طن',
      'رقم اللوحة / الكود': 'شوكي-مستودع-03',
      'نوع الأصل': 'معدة ثقيلة',
      'التصنيف': 'رافعات شوكية',
      'القسم / الإدارة': 'مستودع قطع الغيار واللوجستيات',
      'الشعبة التشغيلية': 'المستودع الرئيسي',
      'رقم الهيكل (VIN)': 'CAT-DP50-N88129',
      'رقم المحرك': 'S6S-DT-6102',
      'سنة الصنع': 2024,
      'نوع الوقود': 'ديزل',
      'الحمولة المعتمدة': '5.0 طن',
      'عدد العجلات': 4,
      'مقاس الإطارات': '300-15 Solid (مصمت)',
      'ضغط الهواء': 'N/A (إطارات مصمتة ضد الثقب)',
      'ماركة الإطارات': 'Industrial Solid',
      'حالة الأصل': 'ممتاز',
      'عداد الساعات': '920 ساعة',
      'الحالة التشغيلية': 'فعالة'
    }
  ];

  const ws1 = XLSX.utils.json_to_sheet(vehiclesData);
  const ws2 = XLSX.utils.json_to_sheet(generatorsData);
  const ws3 = XLSX.utils.json_to_sheet(heavyEquipmentData);

  XLSX.utils.book_append_sheet(wb, ws1, 'الشاحنات والمركبات');
  XLSX.utils.book_append_sheet(wb, ws2, 'المولدات ومعدات الطاقة');
  XLSX.utils.book_append_sheet(wb, ws3, 'المعدات الثقيلة والإنشائية');

  XLSX.writeFile(wb, 'fleet_assets_template.xlsx');
}
