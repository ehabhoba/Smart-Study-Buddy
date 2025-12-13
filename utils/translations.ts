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

    startAnalysis: "ابدأ التلخيص واختبار الذكاء",
    processingTitle: "جاري عصر الكتاب...",
    processingDesc: "يقوم الذكاء الاصطناعي الآن بضغط المحتوى، استخراج الأسئلة، وإعداد الاختبار التفاعلي.",
    
    // Result View
    tabInfo: "البيانات",
    tabSummary: "كبسولة الامتحان",
    tabFlashcards: "بطاقات",
    tabQuiz: "اختبار تفاعلي",
    tabPlan: "الخطة",
    tabQa: "بنك الأسئلة",
    tabChat: "البحث الذكي",
    
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
    
    quizTitle: "اختبر نفسك (نظام تفاعلي)",
    quizScore: "النتيجة:",
    quizExplanation: "الشرح والتوضيح:",
    quizNoData: "لم يتم توليد اختبار.",
    
    planTitle: "خطة المذاكرة المقترحة",
    noPlan: "لا توجد خطة مذاكرة متاحة.",
    
    chatWelcome: "أهلاً بك! أنا مساعدك الذكي. أنا متصل بـ Google Search للإجابة على أسئلتك بمعلومات محدثة.",
    chatPlaceholder: "ابحث أو اسأل عن أي شيء في الكتاب...",
    chatError: "عذراً، حدث خطأ في الاتصال.",
    groundingSources: "مصادر البحث:",
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

    startAnalysis: "Start Analysis & Quiz Gen",
    processingTitle: "Crunching the book...",
    processingDesc: "AI is compressing content, highlighting key points, and generating an interactive quiz.",
    
    // Result View
    tabInfo: "Info",
    tabSummary: "Summary",
    tabFlashcards: "Cards",
    tabQuiz: "Interactive Quiz",
    tabPlan: "Plan",
    tabQa: "Q&A Bank",
    tabChat: "Smart Search",
    
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
    
    quizTitle: "Test Yourself (Interactive Mode)",
    quizScore: "Score:",
    quizExplanation: "Explanation:",
    quizNoData: "No quiz generated.",
    
    planTitle: "Suggested Study Plan",
    noPlan: "No study plan available.",
    
    chatWelcome: "Welcome! I'm your smart assistant connected to Google Search. Ask me anything.",
    chatPlaceholder: "Search or ask about anything in the book...",
    chatError: "Sorry, connection error.",
    groundingSources: "Sources:",
  }
};