import { vehicles, maintenanceOrders, inventory, technicians } from "../data";

export interface AIMessage {
  role: 'user' | 'model';
  text: string;
}

export async function getAIProjectManagerInsight(messages: AIMessage[], customModifier?: string): Promise<string> {
  const context = `
    أنت مدير مشروع محترف (Project Manager) في مركز صيانة مركبات ومعدات ثقيلة تابع لمؤسسة رسمية.
    لديك وصول إلى البيانات التالية (للاطلاع فقط):
    - عدد المركبات الإجمالي: ${vehicles.length}
    - عدد أوامر الصيانة الحالية: ${maintenanceOrders.length}
    - عدد الفنيين المتاحين: ${technicians.length}
    - حالة المخزن: ${inventory.length} أصناف

    وظيفتك هي:
    1. تقديم نصائح استراتيجية لتحسين سير العمل.
    2. توجيه الفنيين والمشرفين بناءً على الأولويات.
    3. المساعدة في اتخاذ قرارات بشأن توزيع المهام.
    4. الرد بأسلوب مهني، جاد، وداعم (باللغة العربية).

    ${customModifier ? `توجيهات إضافية بناء على السيناريو والخصائص الحالية: ${customModifier}` : ''}

    يرجى الحفاظ على الإجابات موجزة واحترافية.
  `;

  try {
    const res = await fetch("/api/ai/project-manager-insight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, context }),
    });
    if (!res.ok) {
      throw new Error("Failed server-side project insights query");
    }
    const data = await res.json();
    return data.text || "عذراً، لم أستطع معالجة الطلب حالياً.";
  } catch (error) {
    console.error("AI service helper error:", error);
    return "حدث خطأ أثناء الاتصال بمدير المشروع الذكي على الخادم.";
  }
}

export async function generateAIPERepairSteps(category: string, description: string): Promise<string[]> {
  try {
    const res = await fetch("/api/ai/generate-maintenance-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, description }),
    });
    if (!res.ok) {
      throw new Error("Failed server-side steps generation query");
    }
    const data = await res.json();
    if (data.steps && Array.isArray(data.steps) && data.steps.length === 5) {
      return data.steps;
    }
    throw new Error("Steps output was invalid size");
  } catch (error) {
    console.error("AI Steps Generation client-fetch error, using fallback...", error);
    return getFallbackSteps(category, description);
  }
}

function getFallbackSteps(category: string, description: string): string[] {
  const cleanDesc = description || "الصيانة الفنية العامة";
  if (category === "electrical") {
    return [
      `📋 فحص تشخيصي بجهاز الفحص الإلكتروني لتحديد كود العطل الـ OBD لـ (${cleanDesc})`,
      `📦 قياس الجهد وتدقيق الدوائر الكهربائية والمنصهرات المتصلة وحجز الأسلاك البديلة`,
      `🔧 تفكيك الأجزاء المتأثرة والمباشرة في استبدال الحشوات أو الحساس المعيب بدقة بالورشة`,
      `🧪 تشغيل واختبار عزل الكهرباء وقراءة الحساسات الحية بعد التغذية للتأكد من زوال العطل`,
      `🚚 تسجيل قراءة المقاومة بالجهاز، غسيل الآلية وتسليمها للاعتماد والتشغيل النهائي`
    ];
  } else if (category === "mechanical") {
    return [
      `📋 تفريغ السوائل والفحص البصري الدقيق لمكان المشكلة ومستوى ترسب الزيوت لـ (${cleanDesc})`,
      `📦 طلب طقم الوجه أو الأذرعة المقررة والمكابح من مستودع الأصول لتأمين الغيار والقطع`,
      `🔧 تفكيك ميكانيكي كامل للترس أو الذراع المتأثر وتركيب البدائل بعزم الشد الفني الموصى به`,
      `🧪 معايرة المحاذاة والتشغيل الأولي بالفحص ومراقبة ضغط الزيت لسلامة المنظومة الميكانيكية`,
      `🚚 تنظيف البقع المنسكبة بمرش المحلول الفني، غسيل الآلية وتسليمها للاعتماد الهندسي`
    ];
  } else if (category === "cooling") {
    return [
      `📋 فحص مستويات غاز الفريون وكبس الدائرة بالنيتروجين لتحديد بقع تسرب التبريد لـ (${cleanDesc})`,
      `📦 سحب الفلتر المعيب وحيازة الضاغط أو صمام التمدد المعتمد لتكفل تيار البرودة السليم`,
      `🔧 تفريغ المنظومة وصيانة المروحة وتغيير الحشوات المهتلكة مع شد أنابيب غاز التكييف`,
      `🧪 كبس دائرة الغاز وشحن المنظومة بالفريون الخاص وقياس درجات الحرارة للمخارج الهوائية`,
      `🚚 تطهير قنوات تزويد الهواء بالمرذاذ المعقم، غسيل الآلية وتسليمها لقائد الحافلة`
    ];
  } else if (category === "hydraulic") {
    return [
      `📋 فحص مستوى ضغط زيت الموائع الهيدروليكية وتشخيص تهريب الصمامات أو رافع لـ (${cleanDesc})`,
      `📦 استعادة الخراطيم المعززة عيار الضغط العالي والجلود وتوريد كمية الزيت المهدرجة المناسبة`,
      `🔧 فك الذراع الهيدروليكي أو الأسطوانة، تصريف السوائل المهدرة، وتثبيت الحشوات الفولاذية بامتثال`,
      `🧪 اختبار تمدد الرافعة وسلامة القفل الذاتي وتحريك السلالم تحت ضغط كامل لمشاهدة الانسيابية`,
      `🚚 فحص مستشعر الحمل، مسح وتزييت ذراع التلسكوب، غسيل الآلية والتسليم للمشرف`
    ];
  } else {
    return [
      `📋 الكشف الهندسي الشامل على أبعاد الهيكل ودرجة اعوجاج الشاسيه لتحديد التدخل لـ (${cleanDesc})`,
      `📦 جلب الصاج المصفح والمعجون الحراري عالي المتانة ومطابقة عينة طلاء الكمبيوتر الخاصة`,
      `🔧 شد الشاسيه على البارد بتقنية الليزر ومعالجة الخدوش والصدمات باللحام وتمليس الأسطح`,
      `🧪 رش الطلاء العازل والصبغ بالفرن الحراري ومطابقة اللمعان والوزن الإيروديناميكي للمركبة`,
      `🚚 تركيب دعامات الحماية، غسيل الآلية بالكامل وصقل الهيكل الخارجي وتسليمها فوراً`
    ];
  }
}
