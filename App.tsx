import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultView from './components/ResultView';
import { AppStatus, SummaryLevel, AnalysisResult } from './types';
import { extractTextFromPdf } from './services/pdfService';
import { analyzeCurriculum } from './services/geminiService';
import { Loader2, Sparkles, FileCheck, AlertTriangle, BrainCircuit, Target, BookOpen, Layers } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [progress, setProgress] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>(SummaryLevel.BALANCED);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize from local storage if available for user convenience
  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) setApiKey(savedKey);
  }, []);

  // Save key when changed
  useEffect(() => {
    if (apiKey) localStorage.setItem('gemini_api_key', apiKey);
  }, [apiKey]);

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
      setError('فشل في قراءة ملف PDF. تأكد أن الملف سليم وليس محمياً بكلمة مرور.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleStartAnalysis = async () => {
    if (!apiKey) {
      setError('يرجى إدخال مفتاح API الخاص بـ Gemini أولاً.');
      return;
    }

    if (!extractedText) {
      setError('لا يوجد نص للمعالجة.');
      return;
    }

    setStatus(AppStatus.PROCESSING);
    setError(null);

    try {
      const analysis = await analyzeCurriculum(apiKey, extractedText, summaryLevel);
      setResult(analysis);
      setStatus(AppStatus.COMPLETE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. تحقق من المفتاح أو اتصال الإنترنت.');
      setStatus(AppStatus.ERROR); // Don't reset to READY so user sees error, but allow retry logic if needed
    }
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setExtractedText('');
    setResult(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <Header apiKey={apiKey} setApiKey={setApiKey} />

      <main className="flex-grow container mx-auto px-4 py-8">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-r-4 border-red-500 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
            <AlertTriangle className="text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {status === AppStatus.IDLE && (
          <div className="max-w-2xl mx-auto mt-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                حوّل كتبك الدراسية إلى كبسولات امتحانات ذكية
              </h2>
              <p className="text-gray-600 text-lg">
                ارفع كتابك PDF، وسيقوم الذكاء الاصطناعي بتحليله، وتكثيفه بنسبة 90%، واستخراج بنك الأسئلة الشامل.
              </p>
            </div>
            <FileUpload onFileSelect={handleFileSelect} />
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
                     {status === AppStatus.READING ? 'جاري قراءة الملف...' : 'تم تجهيز الملف'}
                   </p>
                 </div>
              </div>
              {status !== AppStatus.PROCESSING && (
                <button onClick={reset} className="text-sm text-gray-400 hover:text-red-500">إلغاء</button>
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
                 <label className="block text-sm font-medium text-gray-700 mb-3">اختر نمط التلخيص:</label>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.CONCISE)}
                      className={`p-4 rounded-xl border-2 text-right transition-all group ${summaryLevel === SummaryLevel.CONCISE ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-primary-700">
                        <Target size={20} />
                        <span className="font-bold text-gray-900">كبسولة الامتحان</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        اضغط الـ 100 صفحة في 10 صفحات. ملخص ملون 🔴🟢 يحتوي على الزبدة والأسئلة فقط.
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.BALANCED)}
                      className={`p-4 rounded-xl border-2 text-right transition-all group ${summaryLevel === SummaryLevel.BALANCED ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Layers size={20} />
                        <span className="font-bold text-gray-900">تلخيص متوازن</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        شرح للمفاهيم الأساسية، مناسب للمذاكرة اليومية السريعة.
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => setSummaryLevel(SummaryLevel.COMPREHENSIVE)}
                      className={`p-4 rounded-xl border-2 text-right transition-all group ${summaryLevel === SummaryLevel.COMPREHENSIVE ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500' : 'border-gray-200 hover:border-primary-300'}`}
                    >
                      <div className="flex items-center gap-2 mb-2 text-purple-600">
                        <BookOpen size={20} />
                        <span className="font-bold text-gray-900">تلخيص شامل</span>
                      </div>
                      <div className="text-xs text-gray-500 leading-relaxed">
                        تغطية دقيقة لكل تفاصيل الكتاب. بديل كامل للكتاب الأصلي.
                      </div>
                    </button>
                 </div>

                 <button
                  onClick={handleStartAnalysis}
                  className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                 >
                   <Sparkles size={20} />
                   ابدأ التلخيص واستخراج الأسئلة
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
                <h3 className="text-xl font-bold text-gray-800">جاري عصر الكتاب...</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  يقوم الذكاء الاصطناعي الآن بضغط الـ 100 صفحة إلى 10، وتلوين النقاط الهامة، واستخراج كافة الأسئلة.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {status === AppStatus.COMPLETE && result && (
           <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-4">
               <h2 className="text-2xl font-bold text-gray-800">كبسولة المراجعة النهائية</h2>
               <button onClick={reset} className="text-primary-600 hover:underline text-sm font-medium">
                 تحليل كتاب آخر
               </button>
             </div>
             {/* Pass apiKey and extractedText to enable Chat */}
             <ResultView result={result} apiKey={apiKey} originalText={extractedText} />
           </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 المُلخص الذكي. جميع الحقوق محفوظة.</p>
          <p className="mt-1">مدعوم بواسطة Google Gemini 2.5 Flash with Thinking Mode</p>
        </div>
      </footer>
    </div>
  );
};

export default App;