
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultView from './components/ResultView';
import SeoEmpire from './components/SeoEmpire';
import NotesDebug from './components/NotesDebug'; // Import the new component
import { AppStatus, SummaryLevel, AnalysisResult, Language, OutputLanguage } from './types';
import { extractTextFromPdf } from './services/pdfService';
import { analyzeCurriculum } from './services/geminiService';
import { Loader2, Sparkles, FileCheck, AlertTriangle, BrainCircuit, Target, BookOpen, Layers, Globe, Languages } from 'lucide-react';
import { translations } from './utils/translations';
import { KEYWORD_CLUSTERS, generateSeoContent } from './utils/seoConstants';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  // Settings
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>(SummaryLevel.BALANCED);
  const [outputLanguage, setOutputLanguage] = useState<OutputLanguage>('original');
  const [language, setLanguage] = useState<Language>('ar'); // UI Language

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // SEO State
  const [dynamicTitle, setDynamicTitle] = useState('');
  
  // Debug Mode State
  const [showNotesDebug, setShowNotesDebug] = useState(false);

  const t = translations[language];

  // Initialize Language & SEO
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang) setLanguage(savedLang);

    // Initial SEO Check on Load
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync HTML dir/lang & Document Title
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('app_language', language);
    
    // Dynamic Title Logic
    if (dynamicTitle) {
       document.title = dynamicTitle;
    } else {
        if (language === 'ar') {
        document.title = fileName 
            ? `${fileName} | المُلخص الذكي`
            : 'المُلخص الذكي: تحويل الصور و PDF إلى ملخصات | Smart Study Buddy';
        } else {
        document.title = fileName
            ? `${fileName} | Smart Study Buddy`
            : 'Smart Study Buddy | AI Curriculum Tutor & PDF Converter';
        }
    }

  }, [language, fileName, dynamicTitle]);

  const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Check for Debug Route
      if (hash === '#/notes') {
          setShowNotesDebug(true);
          setDynamicTitle('Supabase Debug | Notes');
          return;
      } else {
          setShowNotesDebug(false);
      }

      const cleanHash = hash.replace('#/', '').replace(/-/g, ' ');
      if (cleanHash) {
          // Decode URI component to handle Arabic characters in URL
          try {
            const decodedHash = decodeURIComponent(cleanHash);
            setDynamicTitle(`${decodedHash} | مجاناً بالذكاء الاصطناعي`);
          } catch (e) {
             console.log("Hash decode error", e);
          }
      }
  };

  const handleSeoNavigate = (keyword: string) => {
      window.location.hash = `/${keyword.replace(/\s+/g, '-')}`;
      setDynamicTitle(`${keyword} | أداة الذكاء الاصطناعي المجانية`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileSelect = async (file: File) => {
    setStatus(AppStatus.READING);
    setError(null);
    setProgress(0);
    setFileName(file.name);

    try {
      const text = await extractTextFromPdf(file, (p) => setProgress(p));
      setExtractedText(text);
      setStatus(AppStatus.READY);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setError(language === 'ar' ? 'فشل في قراءة ملف PDF.' : 'Failed to read PDF file.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleStartAnalysis = async () => {
    if (!extractedText) {
      setError(language === 'ar' ? 'لا يوجد نص للمعالجة.' : 'No text to process.');
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const analysis = await analyzeCurriculum(extractedText, summaryLevel, outputLanguage);
      setResult(analysis);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي.' : 'Error communicating with AI.'));
      setStatus(AppStatus.ERROR);
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setExtractedText('');
    setResult(null);
    setError(null);
    setProgress(0);
    setFileName('');
    setDynamicTitle('');
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
  };

  // If Debug Mode is active, render only the NotesDebug component
  if (showNotesDebug) {
      return (
          <div className={`min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans ${language === 'en' ? 'font-inter' : ''}`}>
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                  <div className="mb-4">
                      <button onClick={() => window.location.hash = ''} className="text-primary-600 underline">
                          &larr; {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                      </button>
                  </div>
                  <NotesDebug />
              </main>
          </div>
      );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans ${language === 'en' ? 'font-inter' : ''}`}>
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-s-4 border-red-500 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
                {dynamicTitle ? (
                    <span className="text-primary-600">{dynamicTitle.split('|')[0]}</span>
                ) : (
                    language === 'ar' ? 'حوّل كتبك الدراسية إلى ملخصات ذكية' : 'Turn Textbooks into Smart Summaries'
                )}
              </h2>
              <p className="text-gray-600 text-lg">
                 {language === 'ar' 
                   ? 'ارفع ملف PDF أو صورة، وسيقوم الذكاء الاصطناعي بتحليله، تلخيصه، واستخراج الأسئلة. أداة شاملة للكتابة والتحويل.'
                   : 'Upload PDF or Image. AI will analyze, summarize, and extract questions. The ultimate AI Writing & Conversion tool.'}
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
            
            {/* Rich SEO Content Injection */}
            <div className="mt-20 border-t border-gray-100 pt-10">
               <div 
                 className="prose prose-sm md:prose-base max-w-none text-gray-500 bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                 dangerouslySetInnerHTML={{ __html: generateSeoContent() }}
               />
            </div>
          </div>
        )}

        {(status === AppStatus.READING || status === AppStatus.READY || status === AppStatus.PROCESSING || status === AppStatus.ERROR) && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                   <FileCheck size={24} />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg">{fileName}</h3>
                   <p className="text-sm text-gray-500">
                     {status === AppStatus.READING ? t.readingFile : t.fileReady}
                   </p>
                 </div>
              </div>
              {status !== AppStatus.PROCESSING && (
                <button onClick={reset} className="text-sm text-gray-400 hover:text-red-500">{t.cancel}</button>
              )}
            </div>

            {/* Progress Bar for Reading PDF */}
            {status === AppStatus.READING && (
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2 overflow-hidden">
                <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            {/* Configuration Area */}
            {(status === AppStatus.READY || status === AppStatus.ERROR) && (
               <div className="mt-8 pt-6 border-t border-gray-100 animate-in fade-in">
                 
                 {/* 1. Language Selection */}
                 <div className="mb-8">
                   <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                     <Languages size={18} className="text-gray-500" />
                     {t.chooseLang}
                   </label>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button 
                        onClick={() => setOutputLanguage('original')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${outputLanguage === 'original' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                      >
                         <BookOpen size={18} />
                         <span className="text-xs md:text-sm">{t.langOriginal}</span>
                      </button>
                      <button 
                        onClick={() => setOutputLanguage('mixed')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${outputLanguage === 'mixed' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                      >
                         <Globe size={18} />
                         <span className="text-xs md:text-sm">{t.langMixed}</span>
                      </button>
                      <button 
                        onClick={() => setOutputLanguage('ar')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${outputLanguage === 'ar' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                      >
                         <span>🇦🇪</span>
                         <span className="text-xs md:text-sm">{t.langAr}</span>
                      </button>
                      <button 
                        onClick={() => setOutputLanguage('en')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${outputLanguage === 'en' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200'}`}
                      >
                         <span>🇺🇸</span>
                         <span className="text-xs md:text-sm">{t.langEn}</span>
                      </button>
                   </div>
                 </div>

                 {/* 2. Style Selection */}
                 <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                   <Target size={18} className="text-gray-500" />
                   {t.chooseStyle}
                 </label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.CONCISE)}
                      className={`p-4 rounded-xl border-2 text-start transition-all group ${summaryLevel === SummaryLevel.CONCISE ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-primary-700">
                        <Target size={20} />
                        <span className="font-bold text-gray-900">{t.styleExamCapsule}</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {t.styleExamDesc}
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.BALANCED)}
                      className={`p-4 rounded-xl border-2 text-start transition-all group ${summaryLevel === SummaryLevel.BALANCED ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Layers size={20} />
                        <span className="font-bold text-gray-900">{t.styleBalanced}</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {t.styleBalancedDesc}
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.COMPREHENSIVE)}
                      className={`p-4 rounded-xl border-2 text-start transition-all group ${summaryLevel === SummaryLevel.COMPREHENSIVE ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <BookOpen size={20} />
                        <span className="font-bold text-gray-900">{t.styleComprehensive}</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        {t.styleComprehensiveDesc}
                      </div>
                    </button>
                 </div>

                 <button
                  onClick={handleStartAnalysis}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                 >
                   <Sparkles size={20} />
                   {t.startAnalysis}
                 </button>
               </div>
            )}

            {/* Processing State */}
            {status === AppStatus.PROCESSING && (
              <div className="text-center py-12 animate-in fade-in">
                <div className="relative w-16 h-16 mx-auto mb-6">
                   <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
                   <BrainCircuit className="absolute inset-0 m-auto text-primary-500 animate-pulse" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{t.processingTitle}</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {t.processingDesc}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {status === AppStatus.COMPLETE && result && (
           <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-gray-800">{language === 'ar' ? 'كبسولة المراجعة النهائية' : 'Final Review Capsule'}</h2>
               <button onClick={reset} className="text-primary-600 hover:underline text-sm font-medium">
                 {language === 'ar' ? 'تحليل ملف آخر' : 'Analyze another file'}
               </button>
             </div>
             {/* Pass apiKey and extractedText to enable Chat */}
             <ResultView result={result} originalText={extractedText} language={language} />
           </div>
        )}

        {/* SEO EMPIRE SECTION - Only on IDLE to avoid cluttering results */}
        {status === AppStatus.IDLE && (
            <SeoEmpire onNavigate={handleSeoNavigate} />
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 {t.title}. {language === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}</p>
          <p className="mt-1">Powered by Google Gemini 2.5 Flash with Thinking Mode</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
