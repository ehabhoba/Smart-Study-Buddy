import { Language } from '../types';

export const translations = {
  ar: {
    title: "المُلخص الذكي",
    subtitle: "Smart Study Buddy",
    apiKeyPlaceholder: "أدخل Gemini API Key",
    uploadTitle: "ارفع ملف المنهج هنا",
    uploadSubtitle: "يمكنك سحب وإفلات الملف أو الضغط للاختيار (PDF فقط)",
    uploadError: "يرجى رفع ملف PDF فقط",
    readingFile: "جاري قراءة الملف...",
    fileReady: "تم تجهيز الملف",
    cancel: "إلغاء",
    
    // Configuration
    chooseStyle: "اختر نمط التلخيص:",
    styleExamCapsule: "كبسولة الامتحان",
    styleExamDesc: "اضغط الـ 100 صفحة في 10 صفحات. ملخص ملون 🔴🟢 يحتوي على الزبدة والأسئلة فقط.",
    styleBalanced: "تلخيص متوازن",
    styleBalancedDesc: "شرح للمفاهيم الأساسية، مناسب للمذاكرة اليومية السريعة.",
    styleComprehensive: "تلخيص شامل",
    styleComprehensiveDesc: "تغطية دقيقة لكل تفاصيل الكتاب. بديل كامل للكتاب الأصلي.",
    
    chooseLang: "لغة المخرجات (الملخص):",
    langOriginal: "نفس لغة الكتاب (تلقائي)",
    langAr: "العربية",
    langEn: "الإنجليزية",
    langMixed: "مختلط (شرح عربي + مصطلحات إنجليزي)",

    startAnalysis: "ابدأ التلخيص واستخراج الأسئلة",
    processingTitle: "جاري عصر الكتاب...",
    processingDesc: "يقوم الذكاء الاصطناعي الآن بضغط المحتوى وتلوين النقاط الهامة واستخراج الأسئلة.",
    
    // Result View
    tabInfo: "البيانات",
    tabSummary: "كبسولة الامتحان",
    tabFlashcards: "بطاقات",
    tabPlan: "الخطة",
    tabQa: "الأسئلة",
    tabChat: "المساعد",
    
    searchPlaceholder: "بحث...",
    themeLight: "فاتح",
    themeDark: "داكن",
    themeSepia: "ورقي",
    fontSize: "حجم الخط",
    
    copyTooltip: "نسخ النص",
    downloadWord: "تحميل Word",
    downloadImage: "صورة",
    downloadExcel: "Excel",
    
    listen: "استمع للملخص",
    stopListen: "إيقاف القراءة",
    
    metaSubject: "المادة الدراسية",
    metaStage: "المرحلة",
    metaCurriculum: "المنهج",
    metaLang: "لغة الكتاب",
    metaOverview: "نظرة عامة شاملة",
    metaTitle: "بيانات الكتاب المحللة",
    
    flashcardFront: "المصطلح / السؤال",
    flashcardBack: "التعريف / الإجابة",
    clickToFlip: "اضغط للقلب",
    noFlashcards: "لم يتم توليد بطاقات لهذا المحتوى.",
    
    planTitle: "خطة المذاكرة المقترحة",
    noPlan: "لا توجد خطة مذاكرة متاحة.",
    
    chatWelcome: "أهلاً بك! أنا مساعدك الذكي لهذا الكتاب. يمكنك سؤالي عن أي نقطة غامضة، أو طلب شرح إضافي.",
    chatPlaceholder: "اسأل المساعد الذكي عن أي شيء في الكتاب...",
    chatError: "عذراً، حدث خطأ في الاتصال.",
  },
  en: {
    title: "Smart Study Buddy",
    subtitle: "AI Curriculum Summarizer",
    apiKeyPlaceholder: "Enter Gemini API Key",
    uploadTitle: "Upload Curriculum File",
    uploadSubtitle: "Drag & drop file or click to select (PDF only)",
    uploadError: "Please upload a PDF file only",
    readingFile: "Reading file...",
    fileReady: "File Ready",
    cancel: "Cancel",
    
    // Configuration
    chooseStyle: "Select Summary Style:",
    styleExamCapsule: "Exam Capsule",
    styleExamDesc: "Compress 100 pages into 10. Colorful summary 🔴🟢 with core concepts & questions only.",
    styleBalanced: "Balanced",
    styleBalancedDesc: "Key concepts explained. Suitable for quick daily study.",
    styleComprehensive: "Comprehensive",
    styleComprehensiveDesc: "Detailed coverage of every chapter. A complete alternative to the book.",
    
    chooseLang: "Output Language:",
    langOriginal: "Same as Book (Auto)",
    langAr: "Arabic",
    langEn: "English",
    langMixed: "Mixed (Ar Explanations + En Terms)",

    startAnalysis: "Start Analysis & Question Extraction",
    processingTitle: "Crunching the book...",
    processingDesc: "AI is compressing content, highlighting key points, and extracting questions.",
    
    // Result View
    tabInfo: "Info",
    tabSummary: "Summary",
    tabFlashcards: "Cards",
    tabPlan: "Plan",
    tabQa: "Q&A",
    tabChat: "Assistant",
    
    searchPlaceholder: "Search...",
    themeLight: "Light",
    themeDark: "Dark",
    themeSepia: "Sepia",
    fontSize: "Font Size",
    
    copyTooltip: "Copy Text",
    downloadWord: "Download Word",
    downloadImage: "Image",
    downloadExcel: "Excel",
    
    listen: "Listen",
    stopListen: "Stop",
    
    metaSubject: "Subject",
    metaStage: "Stage",
    metaCurriculum: "Curriculum",
    metaLang: "Book Language",
    metaOverview: "Comprehensive Overview",
    metaTitle: "Analyzed Metadata",
    
    flashcardFront: "Term / Question",
    flashcardBack: "Definition / Answer",
    clickToFlip: "Click to flip",
    noFlashcards: "No flashcards generated.",
    
    planTitle: "Suggested Study Plan",
    noPlan: "No study plan available.",
    
    chatWelcome: "Welcome! I'm your smart study assistant. Ask me anything about the book.",
    chatPlaceholder: "Ask the assistant about anything in the book...",
    chatError: "Sorry, connection error.",
  }
};