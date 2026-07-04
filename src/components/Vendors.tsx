import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Handshake, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Layers, 
  Sparkles,
  ChevronDown,
  Filter,
  Check,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { Vendor, SupplyOrder, InventoryItem } from '../types';
import VendorReports from './VendorReports';
import { useLanguage } from '../services/LanguageContext';
import ContextualHelp from './ContextualHelp';

interface VendorsProps {
  user: {
    id: string;
    name: string;
    role: 'admin' | 'technician' | 'viewer';
  };
}

const generateHistoricalOrders = (vendorsList: Vendor[]): SupplyOrder[] => {
  const generated: SupplyOrder[] = [];
  const partsList = [
    { id: 'i1', name: 'فحمات فرامل خلفية هايلوكس', partNumber: 'BRK-0021-H', basePrice: 150, vendorId: 'v1' },
    { id: 'i2', name: 'طقم وسائد هوائية مانع انزلاق ثنائي', partNumber: 'AIR-SLP-M', basePrice: 450, vendorId: 'v2' },
    { id: 'i3', name: 'إطار شاحنة 22.5', partNumber: 'TIR-0099', basePrice: 850, vendorId: 'v3' },
    { id: 'i1', name: 'فلتر زيت محرك ديزل شل', partNumber: 'OIL-FLT-S', basePrice: 65, vendorId: 'v4' }
  ];

  const currentDate = new Date('2026-05-26');
  let orderIndex = 1;

  for (let m = 0; m < 12; m++) {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - m, 15);
    const dateStr = d.toISOString().split('T')[0];

    vendorsList.forEach((vendor) => {
      const part = partsList.find(p => p.vendorId === vendor.id) || partsList[0];
      const qty = Math.floor(Math.random() * 8) + 12;
      const unitPrice = Math.round(part.basePrice * (0.95 + Math.random() * 0.1));
      const totalPrice = qty * unitPrice;
      
      const isLatestMonth = m === 0;
      const status = isLatestMonth 
        ? (Math.random() > 0.4 ? 'delivered' : 'pending')
        : 'delivered';

      generated.push({
        id: `so-hist-${orderIndex++}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        partId: part.id,
        partName: part.name,
        partNumber: part.partNumber,
        quantity: qty,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        orderDate: dateStr,
        expectedDeliveryDate: new Date(d.getTime() + 7 * 24 * 60 * 60 * 1050).toISOString().split('T')[0],
        actualDeliveryDate: status === 'delivered' ? new Date(d.getTime() + 5 * 24 * 60 * 60 * 1050).toISOString().split('T')[0] : undefined,
        status: status,
        deliveryNote: 'شحنة مجدولة لإسناد عمليات التوريد وزيادة الكفاءة.'
      });
    });
  }

  return generated;
};

export default function Vendors({ user }: VendorsProps) {
  const { language } = useLanguage();
  // --- STATE ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [supplyOrders, setSupplyOrders] = useState<SupplyOrder[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab2] = useState<'vendors' | 'orders' | 'reports'>('vendors');
  const [vendorFilter, setVendorFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'delivered' | 'cancelled' | 'delayed'>('all');

  // Modal State
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<InventoryItem | null>(null);

  // Form State - Vendor
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    reliability: 5,
    categories: '',
    status: 'active' as 'active' | 'suspended'
  });

  // Form State - Supply Order
  const [orderForm, setOrderForm] = useState({
    vendorId: '',
    partId: '',
    quantity: 1,
    unitPrice: 0,
    expectedDeliveryDate: '',
    deliveryNote: ''
  });

  // Feedback Notification State
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerFeedback = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  // --- COMPONENT DID MOUNT / LOAD DATA ---
  useEffect(() => {
    // 1. Load Vendors
    const savedVendors = localStorage.getItem('fleet_vendors_v2');
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    } else {
      // Seed initial vendors
      const initialVendors: Vendor[] = [
        {
          id: 'v1',
          name: 'الشركة العربية المحدودة لقطع الغيار',
          contactName: 'م. أحمد السقاف',
          phone: '0555123456',
          email: 'info@arabianparts.com',
          address: 'المنطقة الصناعية الثانية، الرياض، المملكة العربية السعودية',
          reliability: 5,
          categories: ['فرامل', 'محركات', 'فلاتر'],
          status: 'active'
        },
        {
          id: 'v2',
          name: 'مجموعة النبهان المعتمدة لمرسيدس وشاحنات النقل',
          contactName: 'أ. فهد النبهان',
          phone: '0502987654',
          email: 'support@nabhanparts.sa',
          address: 'طريق الخرج، الرياض، المملكة العربية السعودية',
          reliability: 4,
          categories: ['كهرباء', 'هيدروليك', 'إطارات'],
          status: 'active'
        },
        {
          id: 'v3',
          name: 'إطارات العالمية الموزع المعتمد',
          contactName: 'أ. طارق محمود',
          phone: '0543210987',
          email: 'sales@globaltires.sa',
          address: 'شارع الضباب، الرياض، المملكة العربية السعودية',
          reliability: 5,
          categories: ['إطارات', 'توازن ومقاصات'],
          status: 'active'
        },
        {
          id: 'v4',
          name: 'الزيوت الوطنية والسوائل الصناعية',
          contactName: 'م. عدنان الشريف',
          phone: '0566778899',
          email: 'adnan@nationaloils.sa',
          address: 'الدمام، المنطقة الشرقية، المملكة العربية السعودية',
          reliability: 3,
          categories: ['زيوت وسوائل', 'فلاتر'],
          status: 'suspended'
        }
      ];
      setVendors(initialVendors);
      localStorage.setItem('fleet_vendors_v2', JSON.stringify(initialVendors));
    }

    // 2. Load Supply Orders
    const savedOrders = localStorage.getItem('fleet_supply_orders_v2');
    const savedVendorsForOrders = localStorage.getItem('fleet_vendors_v2');
    const parsedVendors: Vendor[] = savedVendorsForOrders ? JSON.parse(savedVendorsForOrders) : [];
    
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      if (parsedOrders.length <= 3 && parsedVendors.length > 0) {
        const histOrders = generateHistoricalOrders(parsedVendors);
        const merged = [...parsedOrders, ...histOrders.filter((ho: any) => !parsedOrders.some((p: any) => p.id === ho.id))];
        setSupplyOrders(merged);
        localStorage.setItem('fleet_supply_orders_v2', JSON.stringify(merged));
      } else {
        setSupplyOrders(parsedOrders);
      }
    } else {
      // Seed initial supply orders + extensive historical orders
      const initialOrders: SupplyOrder[] = [
        {
          id: 'so-1',
          vendorId: 'v1',
          vendorName: 'الشركة العربية المحدودة لقطع الغيار',
          partId: 'i1',
          partName: 'فحمات فرامل خلفية هايلوكس',
          partNumber: 'BRK-0021-H',
          quantity: 20,
          unitPrice: 150,
          totalPrice: 3000,
          orderDate: '2026-05-10',
          expectedDeliveryDate: '2026-05-18',
          actualDeliveryDate: '2026-05-17',
          status: 'delivered',
          deliveryNote: 'تمت مطابقة المواصفات الفنية عند الاستلام الفعلي بالمستودع.'
        },
        {
          id: 'so-2',
          vendorId: 'v2',
          vendorName: 'مجموعة النبهان المعتمدة لمرسيدس وشاحنات النقل',
          partId: 'i2',
          partName: 'طقم وسائد هوائية مانع انزلاق ثنائي',
          partNumber: 'AIR-SLP-M',
          quantity: 10,
          unitPrice: 450,
          totalPrice: 4500,
          orderDate: '2026-05-20',
          expectedDeliveryDate: '2026-05-28',
          status: 'pending',
          deliveryNote: 'شحنة طارئة لتحديث مخزون شاحنات الأكتروس.'
        },
        {
          id: 'so-3',
          vendorId: 'v3',
          vendorName: 'إطارات العالمية الموزع المعتمد',
          partId: 'i3',
          partName: 'إطار شاحنة 22.5',
          partNumber: 'TIR-0099',
          quantity: 15,
          unitPrice: 850,
          totalPrice: 12750,
          orderDate: '2026-05-15',
          expectedDeliveryDate: '2026-05-22',
          status: 'delayed',
          deliveryNote: 'تأخرت بسبب الفحص الجمركي الإضافي في ميناء الملك عبد العزيز.'
        }
      ];
      
      const vList = parsedVendors.length ? parsedVendors : [
        { id: 'v1', name: 'الشركة العربية المحدودة لقطع الغيار', contactName: 'م. أحمد السقاف', phone: '0555123456', email: 'info@arabianparts.com', address: 'المنطقة الصناعية الثانية، الرياض، المملكة العربية السعودية', reliability: 5, categories: ['فرامل', 'محركات', 'فلاتر'], status: 'active' },
        { id: 'v2', name: 'مجموعة النبهان المعتمدة لمرسيدس وشاحنات النقل', contactName: 'أ. فهد النبهان', phone: '0502987654', email: 'support@nabhanparts.sa', address: 'طريق الخرج، الرياض، المملكة العربية السعودية', reliability: 4, categories: ['كهرباء', 'هيدروليك', 'إطارات'], status: 'active' },
        { id: 'v3', name: 'إطارات العالمية الموزع المعتمد', contactName: 'أ. طارق محمود', phone: '0543210987', email: 'sales@globaltires.sa', address: 'شارع الضباب، الرياض، المملكة العربية السعودية', reliability: 5, categories: ['إطارات', 'توازن ومقاصات'], status: 'active' },
        { id: 'v4', name: 'الزيوت الوطنية والسوائل الصناعية', contactName: 'م. عدنان الشريف', phone: '0566778899', email: 'adnan@nationaloils.sa', address: 'الدمام، المنطقة الشرقية، المملكة العربية السعودية', reliability: 3, categories: ['زيوت وسوائل', 'فلاتر'], status: 'suspended' }
      ];
      
      const histOrders = generateHistoricalOrders(vList as Vendor[]);
      const merged = [...initialOrders, ...histOrders.filter((ho: any) => !initialOrders.some((p: any) => p.id === ho.id))];
      
      setSupplyOrders(merged);
      localStorage.setItem('fleet_supply_orders_v2', JSON.stringify(merged));
    }

    // 3. Load Fleet Inventory (to link parts properly)
    const savedInventory = localStorage.getItem('fleet_inventory_v2');
    if (savedInventory) {
      const parsedInv = JSON.parse(savedInventory);
      setInventoryItems(parsedInv);
    } else {
      // If none, fallback
      const defaultInv = [
        { id: 'i1', name: 'فحمات فرامل خلفية هايلوكس', partNumber: 'BRK-0021-H', quantity: 15, minQuantity: 5, category: 'فرامل', price: 180, supplier: 'الشركة العربية المحدودة لقطع الغيار' },
        { id: 'i2', name: 'طقم وسائد هوائية مانع انزلاق ثنائي', partNumber: 'AIR-SLP-M', quantity: 5, minQuantity: 8, category: 'فرامل', price: 420 },
        { id: 'i3', name: 'إطار شاحنة 22.5', partNumber: 'TIR-0099', quantity: 12, minQuantity: 4, category: 'إطارات', price: 920 }
      ];
      setInventoryItems(defaultInv);
    }
  }, []);

  // Sync to localStorage
  const saveVendorsToStore = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    localStorage.setItem('fleet_vendors_v2', JSON.stringify(newVendors));
  };

  const saveOrdersToStore = (newOrders: SupplyOrder[]) => {
    setSupplyOrders(newOrders);
    localStorage.setItem('fleet_supply_orders_v2', JSON.stringify(newOrders));
  };

  // Sync back to inventory
  const updateInventoryInStore = (updatedInv: InventoryItem[]) => {
    setInventoryItems(updatedInv);
    localStorage.setItem('fleet_inventory_v2', JSON.stringify(updatedInv));
  };

  // --- LOGIC / FILTERING ---
  const filteredVendors = useMemo(() => {
    return vendors.filter(vendor => {
      const matchesSearch = 
        vendor.name.includes(searchTerm) || 
        vendor.contactName.includes(searchTerm) || 
        vendor.phone.includes(searchTerm) || 
        vendor.email.includes(searchTerm) ||
        vendor.categories.some(c => c.includes(searchTerm));
      
      const matchesFilter = 
        vendorFilter === 'all' || 
        vendor.status === vendorFilter;

      return matchesSearch && matchesFilter;
    });
  }, [vendors, searchTerm, vendorFilter]);

  const filteredOrders = useMemo(() => {
    return supplyOrders.filter(order => {
      const matchesSearch = 
        order.vendorName.includes(searchTerm) || 
        order.partName.includes(searchTerm) || 
        order.partNumber.includes(searchTerm) || 
        (order.deliveryNote && order.deliveryNote.includes(searchTerm));
      
      const matchesFilter = 
        orderFilter === 'all' || 
        order.status === orderFilter;

      return matchesSearch && matchesFilter;
    });
  }, [supplyOrders, searchTerm, orderFilter]);

  // --- STATS CALCULATION ---
  const stats = useMemo(() => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'active').length;
    
    const pendingOrders = supplyOrders.filter(o => o.status === 'pending').length;
    const delayedOrders = supplyOrders.filter(o => o.status === 'delayed').length;
    
    const totalSpend = supplyOrders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const pendingSpend = supplyOrders
      .filter(o => o.status === 'pending' || o.status === 'delayed')
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    return {
      totalVendors,
      activeVendors,
      pendingOrders,
      delayedOrders,
      totalSpend,
      pendingSpend
    };
  }, [vendors, supplyOrders]);

  // --- HANDLERS CONTROLLERS ---

  // Handle open Vendor add / edit modal
  const handleOpenVendorModal = (vendor: Vendor | null = null) => {
    if (user.role === 'viewer') {
      triggerFeedback('عذراً، لا تمتلك الصلاحية لإجراء هذه العملية.', 'error');
      return;
    }
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        name: vendor.name,
        contactName: vendor.contactName,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        reliability: vendor.reliability,
        categories: vendor.categories.join('، '),
        status: vendor.status
      });
    } else {
      setEditingVendor(null);
      setVendorForm({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        reliability: 5,
        categories: '',
        status: 'active'
      });
    }
    setIsVendorModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'viewer') return;

    if (!vendorForm.name.trim() || !vendorForm.contactName.trim()) {
      triggerFeedback('يرجى ملء اسم المورد واسم المسؤول كحد أدنى.', 'error');
      return;
    }

    const parsedCategories = vendorForm.categories
      ? vendorForm.categories.split(/[،,\n]+/).map(s => s.trim()).filter(Boolean)
      : [];

    if (editingVendor) {
      // Update
      const updated = vendors.map(v => {
        if (v.id === editingVendor.id) {
          return {
            ...v,
            name: vendorForm.name.trim(),
            contactName: vendorForm.contactName.trim(),
            phone: vendorForm.phone.trim(),
            email: vendorForm.email.trim(),
            address: vendorForm.address.trim(),
            reliability: vendorForm.reliability,
            categories: parsedCategories,
            status: vendorForm.status
          };
        }
        return v;
      });
      saveVendorsToStore(updated);
      triggerFeedback('تم تحديث بيانات المورد بنجاح');
    } else {
      // Create
      const newVendor: Vendor = {
        id: `v-${Date.now()}`,
        name: vendorForm.name.trim(),
        contactName: vendorForm.contactName.trim(),
        phone: vendorForm.phone.trim(),
        email: vendorForm.email.trim(),
        address: vendorForm.address.trim(),
        reliability: vendorForm.reliability,
        categories: parsedCategories,
        status: vendorForm.status
      };
      saveVendorsToStore([...vendors, newVendor]);
      triggerFeedback('تم إضافة المورد الجديد بنجاح');
    }
    setIsVendorModalOpen(false);
  };

  const handleDeleteVendor = (id: string) => {
    if (user.role !== 'admin') {
      triggerFeedback('عذراً، يتطلب هذا الإجراء صلاحية مدير النظام.', 'error');
      return;
    }
    if (window.confirm('هل أنت متأكد من حذف هذا المورد؟ سيتم قطعه من نظام التوريد.')) {
      const filtered = vendors.filter(v => v.id !== id);
      saveVendorsToStore(filtered);
      triggerFeedback('تمت إزالة المورد من السجلات بنجاح', 'success');
    }
  };

  const toggleVendorStatus = (id: string) => {
    if (user.role === 'viewer') return;
    const updated = vendors.map(v => {
      if (v.id === id) {
        const nextStatus: 'active' | 'suspended' = v.status === 'active' ? 'suspended' : 'active';
        triggerFeedback(`تم تغيير حالة المورد إلى: ${nextStatus === 'active' ? 'نشط' : 'موقف'}`);
        return { ...v, status: nextStatus };
      }
      return v;
    });
    saveVendorsToStore(updated);
  };

  // --- SUPPLY ORDERS LOGIC ---

  const handleOpenOrderModal = () => {
    if (user.role === 'viewer') {
      triggerFeedback('عذراً، لا تمتلك الصلاحية الملائمة لإجراء عمليات توريد.', 'error');
      return;
    }
    // Set default order configuration
    const activeVendorsList = vendors.filter(v => v.status === 'active');
    
    setOrderForm({
      vendorId: activeVendorsList[0]?.id || '',
      partId: inventoryItems[0]?.id || '',
      quantity: 10,
      unitPrice: inventoryItems[0]?.price || 100,
      expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      deliveryNote: ''
    });
    setSelectedPart(inventoryItems[0] || null);
    setIsOrderModalOpen(true);
  };

  const handleSelectPartChange = (partId: string) => {
    const part = inventoryItems.find(p => p.id === partId);
    if (part) {
      setSelectedPart(part);
      setOrderForm(prev => ({
        ...prev,
        partId,
        unitPrice: part.price || 100
      }));
    }
  };

  const handleSaveSupplyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (user.role === 'viewer') return;

    if (!orderForm.vendorId) {
      triggerFeedback('يرجى اختيار المورد المسؤول.', 'error');
      return;
    }
    if (!orderForm.partId) {
      triggerFeedback('يرجى تحديد قطعة الغيار المطلوبة للتوريد.', 'error');
      return;
    }
    if (orderForm.quantity <= 0) {
      triggerFeedback('يرجى تحديد كمية موجبة لتوريدها.', 'error');
      return;
    }

    const matchedVendor = vendors.find(v => v.id === orderForm.vendorId);
    const matchedPart = inventoryItems.find(p => p.id === orderForm.partId);

    if (!matchedVendor || !matchedPart) {
      triggerFeedback('حدث خطأ في ربط البيانات المحددة.', 'error');
      return;
    }

    const newOrder: SupplyOrder = {
      id: `so-${Date.now()}`,
      vendorId: matchedVendor.id,
      vendorName: matchedVendor.name,
      partId: matchedPart.id,
      partName: matchedPart.name,
      partNumber: matchedPart.partNumber,
      quantity: Number(orderForm.quantity),
      unitPrice: Number(orderForm.unitPrice),
      totalPrice: Number(orderForm.quantity) * Number(orderForm.unitPrice),
      orderDate: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: orderForm.expectedDeliveryDate,
      status: 'pending',
      deliveryNote: orderForm.deliveryNote.trim()
    };

    saveOrdersToStore([newOrder, ...supplyOrders]);
    setIsOrderModalOpen(false);
    triggerFeedback('تم تسجيل أمر التوريد بنجاح، بانتظار الشحن والاستلام');
  };

  // Change Supply Order Status (specifically Staging for delivered -> Updates inventory correctly!)
  const handleTransitionOrderStatus = (orderId: string, nextStatus: 'pending' | 'delivered' | 'cancelled' | 'delayed') => {
    if (user.role === 'viewer') return;

    const matchedOrder = supplyOrders.find(o => o.id === orderId);
    if (!matchedOrder) return;

    // Check if it's already delivered to prevent double counting
    if (matchedOrder.status === 'delivered') {
      triggerFeedback('تم استلام هذا التوريد مسبقاً، لا يمكن التعديل عليه.', 'error');
      return;
    }

    const updated = supplyOrders.map(o => {
      if (o.id === orderId) {
        const actualDate = nextStatus === 'delivered' ? new Date().toISOString().split('T')[0] : undefined;
        return {
          ...o,
          status: nextStatus,
          actualDeliveryDate: actualDate
        };
      }
      return o;
    });

    // If marked as delivered, INCREMENT local inventory quantity seamlessly!
    if (nextStatus === 'delivered') {
      const updatedInventory = inventoryItems.map(p => {
        if (p.id === matchedOrder.partId) {
          const newQty = (p.quantity || 0) + matchedOrder.quantity;
          
          // Also link supplier if not present
          const hasSupplier = p.supplier ? p.supplier : matchedOrder.vendorName;
          return {
            ...p,
            quantity: newQty,
            supplier: hasSupplier
          };
        }
        return p;
      });
      updateInventoryInStore(updatedInventory);
      triggerFeedback(`تم استلام الطلبية! وإضافة (+${matchedOrder.quantity}) إلى فئات المخزن لـ [${matchedOrder.partName}]`, 'success');
    } else {
      triggerFeedback(`تم تحديث حالة التوريد إلى: ${nextStatus === 'cancelled' ? 'ملغي' : 'متأخر'}`);
    }

    saveOrdersToStore(updated);
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`fixed bottom-6 left-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border text-xs font-black transition-all ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/40' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 dark:bg-rose-950/40'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header section with brand accent */}
      <div className="relative p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-905 rounded-3xl text-white shadow-2xl border border-slate-750/35 overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-blue-500/10 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -ml-20 -mb-20"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-brand-blue-500/15 border border-brand-blue-500/20 px-3 py-1 rounded-full text-[10px] font-black tracking-widest text-[#38bdf8] uppercase">
              <Sparkles size={11} className="animate-spin text-brand-blue-400" />
              <span>إدارة سلسلة التوريد الذكية</span>
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                <Handshake size={32} className="text-brand-blue-400 animate-pulse" />
                <span>{language === 'ar' ? 'نظام إدارة الموردين والتوريد' : 'Supply Chain & Vendors Console'}</span>
              </h1>
              <ContextualHelp 
                id="vendors"
                titleAr="إدارة الموردين وسلسلة التوريد"
                titleEn="Supply Chain & Vendors Console"
                explanationAr="وحدة لوجستية لتسويق وإدارة علاقات الموردين المعتمدين، وأوامر الشراء لمطابقة تسليم قطع الغيار والزيوت والإطارات بدقة، ومراقبة جودة ميعاد التوصيل."
                explanationEn="A procurement workflow monitoring partner ratings, lead times, purchase orders (PO) logs, and automatic inventory shelf increases upon structural confirmation."
                benefitsAr={[
                  "تقييم رقمي ذكي لدرجة الالتزام بالمواعيد ومستويات الجودة لكل مورد.",
                  "متابعة ذكية لحالات الشحن (معلق، مشحون، متأخر، تم التوريد).",
                  "توليد فوري للتقارير والنفقات المالية والشرائية."
                ]}
                benefitsEn={[
                  "Indexes vendor reliability scores and shipment lead lag days.",
                  "Enforces precise state transitions tracking for each purchase order.",
                  "Calculates cumulated supplier purchase values automatically."
                ]}
                tipsAr={[
                  "انقر علامة التبويب 'أوامر الشراء المباشرة' لمطالبة وتدشين فاتورة توريد جديدة لقطع غيار معينة مع إسنادها للمورد المعتمد."
                ]}
                tipsEn={[
                  "Switch to 'Direct Purchase Orders' tab to record and create a new delivery cycle directly into local warehouse slots."
                ]}
                language={language}
              />
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              تكامل شامل يربط قطع الغيار بالموردين المعتمدين، تتبع عروض الأسعار، مراجعة معايير الموثوقية ومواعيد الشحن اللوجيستي مع التحديث الآلي الفوري لأرصدة الرفوف عند الاستلام.
            </p>
          </div>
          
          <button
            onClick={activeTab === 'vendors' ? () => handleOpenVendorModal() : handleOpenOrderModal}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-blue-500 to-sky-600 hover:from-brand-blue-600 hover:to-sky-700 text-white text-xs font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>{activeTab === 'vendors' ? 'إضافة مورد معتمد' : 'تسجيل طلب توريد جديد'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Panel - Dynamic Gradient Styling */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl border bg-gradient-to-br from-sky-50 to-sky-100/50 dark:from-slate-900/40 dark:to-slate-900/10 border-sky-200 dark:border-slate-800 border-r-4 border-r-sky-500 dark:border-r-sky-400 transition-all shadow-md">
          <p className="text-[10px] font-bold text-sky-850 dark:text-sky-300">إجمالي الموردين</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-sky-950 dark:text-white">{stats.totalVendors}</span>
            <div className="p-1 px-1.5 bg-white dark:bg-slate-800 rounded-lg border border-sky-150 dark:border-slate-700 text-[10px] text-sky-700 dark:text-sky-400 font-bold">
              {stats.activeVendors} نشط
            </div>
          </div>
          <p className="text-[9px] text-slate-500 mt-2">الموردون المحليون والدوليون</p>
        </div>

        <div className="p-4 rounded-2xl border bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-slate-900/40 dark:to-slate-900/10 border-amber-200 dark:border-slate-800 border-r-4 border-r-amber-500 dark:border-r-amber-400 transition-all shadow-md">
          <p className="text-[10px] font-bold text-amber-850 dark:text-amber-300">توريدات معلقة (شحن)</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-amber-950 dark:text-white">{stats.pendingOrders}</span>
            <div className={`p-1 px-1.5 bg-white dark:bg-slate-800 rounded-lg border border-amber-150 dark:border-slate-700 text-[10px] font-bold ${stats.pendingOrders > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-400'}`}>
              انتظار الوصول
            </div>
          </div>
          <p className="text-[9px] text-slate-500 mt-2">بانتظار التفريغ بالمستودع</p>
        </div>

        <div className="p-4 rounded-2xl border bg-gradient-to-br from-red-50 to-red-100/50 dark:from-slate-905/40 dark:to-slate-900/10 border-red-200 dark:border-slate-800 border-r-4 border-r-red-500 dark:border-r-red-400 transition-all shadow-md">
          <p className="text-[10px] font-bold text-red-850 dark:text-red-300">منظومة الشحن المتأخر</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-red-950 dark:text-white">{stats.delayedOrders}</span>
            <div className={`p-1 px-1.5 bg-white dark:bg-slate-800 rounded-lg border border-red-150 dark:border-slate-700 text-[10px] font-bold ${stats.delayedOrders > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`}>
              متأخر لوجستياً
            </div>
          </div>
          <p className="text-[9px] text-slate-505 mt-2">تأخرت عما هو مجدول</p>
        </div>

        <div className="p-4 rounded-2xl border bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-slate-900/40 dark:to-slate-900/10 border-emerald-200 dark:border-slate-800 border-r-4 border-r-emerald-500 dark:border-r-emerald-400 transition-all shadow-md">
          <p className="text-[10px] font-bold text-emerald-850 dark:text-emerald-300">قيمة التوريد المكتمل</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-emerald-950 dark:text-white">{stats.totalSpend.toLocaleString()} ر.س</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-2">إجمالي المسحوبات المستلمة بنجاح</p>
        </div>

        <div className="p-4 rounded-2xl border bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/40 dark:to-slate-900/10 border-slate-200 dark:border-slate-800 border-r-4 border-r-slate-500 dark:border-r-slate-450 transition-all shadow-md col-span-2 lg:col-span-1">
          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">التزامات جارية (أوردرات موثقة)</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-base font-black text-slate-900 dark:text-white">{stats.pendingSpend.toLocaleString()} ر.س</span>
          </div>
          <p className="text-[9px] text-slate-500 mt-1.5">قيم العقود قيد التنفيذ اللوجستي</p>
        </div>
      </div>

      {/* Main Container w/ Sidebar Filter and tab switches */}
      <div className="bg-white dark:bg-[#0c1017] rounded-3xl border border-slate-100 dark:border-slate-850 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Tabs Switching */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1 rounded-2xl border border-slate-100 dark:border-slate-850 w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => { setActiveTab2('vendors'); setSearchTerm(''); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'vendors' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
              }`}
            >
              <Building2 size={14} />
              <span>قائمة الموردين ({vendors.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab2('orders'); setSearchTerm(''); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
              }`}
            >
              <Calendar size={14} />
              <span>سجلات التوريد ({supplyOrders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab2('reports'); setSearchTerm(''); }}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'reports' 
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-650 dark:hover:text-slate-300'
              }`}
            >
              <TrendingUp size={14} />
              <span>الموثوقية والإنفاق (جديد)</span>
            </button>
          </div>

          {/* Search Input and Filters */}
          {activeTab !== 'reports' && (
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-48">
                <input
                  type="text"
                  placeholder={activeTab === 'vendors' ? 'ابحث باسم المورد، التصنيف، الهاتف...' : 'ابحث باسم القطعة، المورد، رقم التوريد...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 text-xs rounded-2xl outline-none text-slate-900 dark:text-white focus:border-brand-blue-500/50 focus:bg-white"
                />
                <Search className="absolute right-3.5 top-3 text-slate-400" size={14} />
              </div>

              {/* Quick preset dropdown according to targeted views */}
              {activeTab === 'vendors' ? (
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-450">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="all">كل الموردين</option>
                    <option value="active">النشطين فقط</option>
                    <option value="suspended">الموقوفين مؤقتاً</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-slate-450">
                  <Filter size={12} className="text-slate-400" />
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as any)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 px-3 py-2 rounded-xl text-slate-650 dark:text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="all">كل التوريدات</option>
                    <option value="pending">معلق (قيد الانتظار)</option>
                    <option value="delivered">مستلم (تم تفريغ الرفوف)</option>
                    <option value="delayed">متأخر</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- DYNAMIC SECTION CONTENT --- */}
        <div className="p-5">
          {activeTab === 'vendors' ? (
            /* --- TAB: VENDORS --- */
            filteredVendors.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <Building2 size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">لم يتم العثور على أي موردين معتمدين</h3>
                  <p className="text-[10px] text-slate-450 mt-1">تأكد من شروط البحث أو قم بإدراج كرت مورد جديد للمصنع.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {filteredVendors.map((vendor) => {
                  const linkedParts = inventoryItems.filter(
                    item => item.supplier === vendor.name || item.supplier === vendor.id
                  );
                    const vendorStripe = vendor.status === 'active'
                      ? 'border-r-[6px] border-r-emerald-500 hover:border-r-emerald-600 bg-emerald-500/0 dark:bg-emerald-950/5'
                      : 'border-r-[6px] border-r-rose-450 hover:border-r-rose-500 bg-rose-500/0 dark:bg-[#18111a]/10';
                    return (
                      <div 
                        key={vendor.id} 
                        className={`p-5 rounded-2xl border border-slate-105 dark:border-slate-800 transition-all duration-300 hover:shadow-lg flex flex-col justify-between ${vendorStripe}`}
                      >
                      <div className="space-y-3.5">
                        
                        {/* Title and Status Row */}
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                              <span>🏢</span>
                              <span>{vendor.name}</span>
                            </h2>
                            <p className="text-[10px] text-slate-450 flex items-center gap-1">
                              <span>مسؤول الاتصال:</span>
                              <span className="font-bold text-slate-700 dark:text-slate-300">👤 {vendor.contactName}</span>
                            </p>
                          </div>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                              vendor.status === 'active'
                                ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-500'
                                : 'bg-rose-500/15 border border-rose-500/20 text-rose-500'
                            }`}>
                              {vendor.status === 'active' ? 'نشط ومعتمد' : 'موقوف مؤقتاً'}
                            </span>
                            
                            {/* Stars rating */}
                            <div className="flex bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={9} 
                                  className={`${i < vendor.reliability ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`} 
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Middle row details */}
                        <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-600 dark:text-slate-400 py-2 border-t border-b border-dashed border-slate-150 dark:border-slate-800">
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400" />
                              <span className="font-mono">{vendor.phone || 'غير مدرج'}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Mail size={11} className="text-slate-400" />
                              <span className="truncate">{vendor.email || 'غير مدرج'}</span>
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="flex items-center gap-1.5">
                              <MapPin size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate">{vendor.address || 'غير مدرج'}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Layers size={11} className="text-slate-400" />
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                قطع مرتبطة بالمخازن: {linkedParts.length}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Linked categories pills */}
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-450 block font-bold">التصنيفات المورّدة:</span>
                          <div className="flex flex-wrap gap-1">
                            {vendor.categories.length === 0 ? (
                              <span className="text-[9px] text-slate-400">لا توجد تصنيفات مرتبطة</span>
                            ) : (
                              vendor.categories.map((cat, i) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/50 dark:border-slate-800">
                                  🏷️ {cat}
                                </span>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Sub linked parts inventory status quick view */}
                        {linkedParts.length > 0 && (
                          <div className="p-2.5 bg-slate-500/5 rounded-xl border border-slate-150/50 dark:border-slate-800/35 space-y-1">
                            <span className="text-[9px] text-brand-blue-500 dark:text-brand-blue-400 font-extrabold flex items-center gap-1">
                              <PackageCheck size={10} />
                              <span>القطع بالمخزن التابعة له:</span>
                            </span>
                            <div className="flex flex-wrap gap-2 text-[9px]">
                              {linkedParts.map(item => (
                                <div key={item.id} className="bg-white dark:bg-slate-950 border px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <span>{item.name}</span>
                                  <span className={`font-mono font-bold ${item.quantity <= item.minQuantity ? 'text-rose-500' : 'text-emerald-500'}`}>
                                    ({item.quantity} قطع)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-3 mt-4 text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => toggleVendorStatus(vendor.id)}
                          className={`px-3 py-1.5 rounded-xl cursor-pointer select-none transition-colors border ${
                            vendor.status === 'active'
                              ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/70 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/70 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                          }`}
                        >
                          {vendor.status === 'active' ? 'إيقاف مؤقت' : 'تفعيل المورد'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenVendorModal(vendor)}
                            className="p-1.5 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-1 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Edit size={12} />
                            <span>تعديل</span>
                          </button>
                          
                          {user.role === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteVendor(vendor.id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/25 text-rose-600 dark:text-rose-400 border border-rose-250/35 dark:border-rose-955 rounded-xl cursor-pointer"
                              title="حذف المورد نهائياً"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          ) : activeTab === 'orders' ? (
            /* --- TAB: ORDERS --- */
            filteredOrders.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <Calendar size={28} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">لم يتم العثور على أي فواتير أو أوامر توريد</h3>
                  <p className="text-[10px] text-slate-450 mt-1">تأكد من شروط البحث أو قم بإنشاء أمر توريد لوجستي جديد.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-850">
                <table className="w-full text-right border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-black text-slate-450 uppercase border-b border-slate-150 dark:border-slate-800">
                      <th className="py-3 px-4">رقم الطلب والقطعة</th>
                      <th className="py-3 px-4">المورّد المسؤول</th>
                      <th className="py-3 px-4">الكمية المطلوبة</th>
                      <th className="py-3 px-4">سعر الوحدة الإجمالي</th>
                      <th className="py-3 px-4">مواعيد التوريد والتسليم</th>
                      <th className="py-3 px-4 text-center">حالة التوريد</th>
                      <th className="py-3 px-4 text-left">العمليات والتحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-xs text-slate-700 dark:text-slate-300">
                    {filteredOrders.map((order) => {
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                          
                          {/* Item/Part Details */}
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="space-y-0.5">
                              <p className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded-md text-slate-500">
                                  {order.id.startsWith('so-') && order.id.length < 10 ? order.id.toUpperCase() : 'ORD-' + order.id.slice(-4).toUpperCase()}
                                </span>
                                <span>{order.partName}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">الرقم المرجعي الفني: {order.partNumber}</p>
                            </div>
                          </td>

                          {/* Vendor Name */}
                          <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-300">
                            🏢 {order.vendorName}
                          </td>

                          {/* Code Quantity */}
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                            {order.quantity} وحدات
                          </td>

                          {/* Unit price and Total price */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 font-mono">
                              <p className="font-bold text-slate-800 dark:text-slate-205">{order.unitPrice.toLocaleString()} ر.س/الوحدة</p>
                              <p className="text-[10px] text-brand-blue-500 font-extrabold">المجموع: {order.totalPrice.toLocaleString()} ر.س</p>
                            </div>
                          </td>

                          {/* Delivery schedules representation */}
                          <td className="py-3.5 px-4 text-[10px]">
                            <div className="space-y-1">
                              <p className="text-slate-550 flex items-center gap-1.5">
                                <Clock size={11} className="text-slate-400" />
                                <span>تاريخ التعاقد:</span>
                                <span className="font-mono font-bold">{order.orderDate}</span>
                              </p>
                              <p className="text-amber-600 flex items-center gap-1.5">
                                <Calendar size={11} className="" />
                                <span>موعد الوصول المتوقع:</span>
                                <span className="font-mono font-bold">{order.expectedDeliveryDate}</span>
                              </p>
                              {order.actualDeliveryDate && (
                                <p className="text-emerald-600 flex items-center gap-1.5">
                                  <CheckCircle size={11} className="" />
                                  <span>تاريخ التفريغ والمطابقة:</span>
                                  <span className="font-mono font-bold">{order.actualDeliveryDate}</span>
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[9px] font-black tracking-wide ${
                              order.status === 'delivered'
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 animate-none'
                                : order.status === 'pending'
                                ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500 animate-pulse'
                                : order.status === 'delayed'
                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-pulse'
                                : 'bg-slate-400/20 border border-slate-550 text-slate-400'
                            }`}>
                              {order.status === 'delivered' ? '✓ تم الاستلام وتفريغ الرفوف' : 
                               order.status === 'pending' ? '⏰ معلق (تحت الإرسال)' : 
                               order.status === 'delayed' ? '⚠️ شحن متأخر لوجستياً' : '✕ ملغي'}
                            </span>
                            {order.deliveryNote && (
                              <p className="text-[8.5px] text-slate-450 mt-1 max-w-[200px] mx-auto text-right truncate" title={order.deliveryNote}>
                                {order.deliveryNote}
                              </p>
                            )}
                          </td>

                          {/* Status Actions */}
                          <td className="py-3.5 px-4 text-left">
                            {order.status !== 'delivered' && order.status !== 'cancelled' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleTransitionOrderStatus(order.id, 'delivered')}
                                  className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-lg shadow-sm cursor-pointer transition-transform"
                                  title="تفريغ واستلام كمية المورد بالرفوف الفعالة حالاً"
                                >
                                  استلام الرفوف
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTransitionOrderStatus(order.id, 'delayed')}
                                  className="p-1 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-amber-500 text-[10px] font-bold cursor-pointer"
                                >
                                  تأخير
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleTransitionOrderStatus(order.id, 'cancelled')}
                                  className="p-1 px-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-lg text-rose-500 text-[10px] font-bold cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <span className="text-[9px] text-slate-400 font-extrabold italic block text-left">
                                {order.status === 'delivered' ? 'مؤرشف ومدرج بالمخزن' : 'معاملة ملغاة'}
                              </span>
                            )}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            /* --- TAB: REPORTS --- */
            <VendorReports vendors={vendors} supplyOrders={supplyOrders} />
          )}
        </div>
      </div>

      {/* --- MODAL: ADD / EDIT VENDOR --- */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1017] w-full max-w-lg rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="text-brand-blue-500" size={18} />
                <span>{editingVendor ? 'تحديث كرت المورد المعتمد' : 'إضافة كرت مورد جديد للمصنع'}</span>
              </h3>
              <button 
                onClick={() => setIsVendorModalOpen(false)}
                className="p-1.5 bg-slate-100/60 dark:bg-slate-900 dark:text-slate-400 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">اسم الشركة أو الموزع المعتمد *</label>
                <input
                  type="text"
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-extrabold text-right focus:bg-white focus:border-brand-blue-500/50"
                  placeholder="مثال: الشركة الوطنية للمكونات المعدنية المحدودة"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">المسؤول عن الاتصال والمتابعة *</label>
                  <input
                    type="text"
                    required
                    value={vendorForm.contactName}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-bold text-right focus:bg-white focus:border-brand-blue-500/50"
                    placeholder="مثال: م. خالد الشامي"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">هاتف التواصل المعتمد (الجوال)</label>
                  <input
                    type="tel"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-mono text-right focus:bg-white focus:border-brand-blue-500/50"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">البريد الإلكتروني التجاري للتواصل</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-mono text-left focus:bg-white focus:border-brand-blue-500/50"
                    placeholder="name@vendor.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">حالة الاعتماد في المنشأة</label>
                  <select
                    value={vendorForm.status}
                    onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-bold cursor-pointer"
                  >
                    <option value="active">نشط ومعتمد للتوريد</option>
                    <option value="suspended">موقوف مؤقتاً بالصلاحية</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">طبيعة تصنيفات قطاعات الغيار المستهدفة (افصل بينها بفواصل أو سطر)</label>
                <textarea
                  value={vendorForm.categories}
                  onChange={(e) => setVendorForm({ ...vendorForm, categories: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-bold text-right focus:bg-white focus:border-brand-blue-500/50 resize-none"
                  placeholder="مثال: إطارات، فرامل، فلاتر، سيور، أذرعة وعضلات"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">العنوان وموقع المستودعات</label>
                <input
                  type="text"
                  value={vendorForm.address}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-bold text-right focus:bg-white focus:border-brand-blue-500/50"
                  placeholder="المدينة والحي والشارع لسرعة الشحن"
                />
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="text-[10px] text-slate-450 block font-bold">مؤشر موثوقية المورّد والالتزام بمواعيد الشحن:</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setVendorForm({ ...vendorForm, reliability: stars })}
                      className={`flex-1 py-1 px-2.5 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-black transition-all cursor-pointer ${
                        vendorForm.reliability === stars
                          ? 'bg-amber-50 text-amber-600 border-amber-300 dark:bg-amber-950/30'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-350'
                      }`}
                    >
                      <span>{stars}</span>
                      <Star size={11} className={`${stars <= vendorForm.reliability ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-150 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                >
                  {editingVendor ? 'تحديث الكرت المعتمد' : 'حفظ وتسجيل المورد'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: NEW SUPPLY ORDER --- */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 dark:bg-slate-950/65 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0c1017] w-full max-w-lg rounded-2xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <PackageCheck className="text-brand-blue-500" size={18} />
                <span>إنشاء أمر توريد لقطع غيار المستودع</span>
              </h3>
              <button 
                onClick={() => setIsOrderModalOpen(false)}
                className="p-1.5 bg-slate-100/60 dark:bg-slate-900 dark:text-slate-400 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveSupplyOrder} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">اختر المورّد المعتمد للتوصيل والاعتماد *</label>
                <select
                  required
                  value={orderForm.vendorId}
                  onChange={(e) => setOrderForm({ ...orderForm, vendorId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-black cursor-pointer"
                >
                  <option value="" disabled>--- اختر من قائمة الموردين المعتمدين ---</option>
                  {vendors
                    .filter(v => v.status === 'active')
                    .map(v => (
                      <option key={v.id} value={v.id}>🏢 {v.name} (المسؤول: {v.contactName})</option>
                    ))}
                </select>
                {vendors.filter(v => v.status === 'active').length === 0 && (
                  <p className="text-[9px] text-rose-500 font-extrabold mt-1">
                    * لا يوجد موردون نشطون بالسيستم حالياً. يجب إضافة مورد نشط أولاً.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">ربط أمر التوريد بقطع غيار المستودع *</label>
                <select
                  required
                  value={orderForm.partId}
                  onChange={(e) => handleSelectPartChange(e.target.value)}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-black cursor-pointer"
                >
                  <option value="" disabled>--- اختر القطعة المطلوبة لرفع رصيد رفوفها ---</option>
                  {inventoryItems.map(p => (
                    <option key={p.id} value={p.id}>📦 {p.name} (رقم: {p.partNumber}) - الرصيد الحالي: ({p.quantity} قطع)</option>
                  ))}
                </select>
              </div>

              {selectedPart && (
                <div className="p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-[10px] flex items-center justify-between">
                  <span className="text-slate-500">مستوى إعادة الطلب الآمن للقطعة:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {selectedPart.minQuantity} قطع (الرصيد الحالي يتطلب توريد عاجل: {selectedPart.quantity <= selectedPart.minQuantity ? '⚠️ نعم' : '✓ مستقر'})
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">الكمية المطلوبة (وحدة) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: Math.max(1, Number(e.target.value)) })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-mono text-right focus:bg-white focus:border-brand-blue-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">سعر الشراء المتفق للوحدة (ر.س) *</label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    step="any"
                    value={orderForm.unitPrice}
                    onChange={(e) => setOrderForm({ ...orderForm, unitPrice: Math.max(0, Number(e.target.value)) })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-mono text-right focus:bg-white focus:border-brand-blue-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 block font-bold">موعد شحن / تسليم متوقع *</label>
                  <input
                    type="date"
                    required
                    value={orderForm.expectedDeliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, expectedDeliveryDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-mono text-right focus:bg-white focus:border-brand-blue-500/50"
                  />
                </div>

                {/* Live total sum calculator */}
                <div className="p-3 bg-brand-blue-50/40 dark:bg-brand-blue-950/10 rounded-xl border border-brand-blue-200/40 dark:border-brand-blue-900/30 text-center">
                  <span className="text-[9px] text-brand-blue-500 dark:text-brand-blue-400 block font-black">إجمالي قيمة التوريد التوريدي:</span>
                  <span className="text-sm font-black text-brand-blue-600 dark:text-brand-blue-300 font-mono">
                    {(orderForm.quantity * orderForm.unitPrice).toLocaleString()} ر.س
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 block font-bold">ملاحظات تسليم الدفعة وسلسلة الشحن</label>
                <textarea
                  value={orderForm.deliveryNote}
                  onChange={(e) => setOrderForm({ ...orderForm, deliveryNote: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50/70 dark:bg-slate-950 border border-slate-150 dark:border-slate-800 text-xs rounded-xl outline-none text-slate-900 dark:text-white font-bold text-right focus:bg-white focus:border-brand-blue-500/50 resize-none"
                  placeholder="مثال: تتطلب شروط تخزين خاصة / تفريغ عالي الحاوية بالممر رقم 5"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-150 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  disabled={vendors.filter(v => v.status === 'active').length === 0}
                  className="px-5 py-2.5 bg-brand-blue-500 hover:bg-brand-blue-600 dark:disabled:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
                >
                  حفظ وتسجيل أمر التوريد
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
