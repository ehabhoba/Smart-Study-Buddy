
import React from 'react';
import { KEYWORD_CLUSTERS } from '../utils/seoConstants';
import { FileText, Image as ImageIcon, Bot, ArrowRight, RefreshCw } from 'lucide-react';

interface SeoEmpireProps {
  onNavigate: (hash: string) => void;
}

const SeoEmpire: React.FC<SeoEmpireProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white border-t border-gray-200 mt-12 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">أدوات الذكاء الاصطناعي (AI Tools Suite)</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            منصة متكاملة تجمع كل ما تحتاجه: تحويل ملفات، تلخيص مناهج، كتابة محتوى، ومسح ضوئي ذكي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* PDF Tools */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-blue-600">
              <FileText size={28} />
              <h3 className="text-xl font-bold">{KEYWORD_CLUSTERS.pdfTools.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{KEYWORD_CLUSTERS.pdfTools.description}</p>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_CLUSTERS.pdfTools.keywords.slice(0, 8).map((kw, idx) => (
                <a 
                  key={idx}
                  href={`#/${kw.replace(/\s+/g, '-')}`}
                  onClick={() => onNavigate(kw)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  {kw}
                </a>
              ))}
              <span className="text-xs text-blue-500 px-2 py-1 cursor-pointer">المزيد...</span>
            </div>
          </div>

          {/* Conversion Tools */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-purple-600">
              <RefreshCw size={28} />
              <h3 className="text-xl font-bold">{KEYWORD_CLUSTERS.conversionTools?.title || "تحويل الصور"}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{KEYWORD_CLUSTERS.conversionTools?.description || "حول صورك إلى نصوص أو ملفات PDF."}</p>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_CLUSTERS.conversionTools?.keywords.slice(0, 8).map((kw, idx) => (
                <a 
                  key={idx}
                  href={`#/${kw.replace(/\s+/g, '-')}`}
                  onClick={() => onNavigate(kw)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  {kw}
                </a>
              ))}
              <span className="text-xs text-purple-500 px-2 py-1 cursor-pointer">المزيد...</span>
            </div>
          </div>

          {/* AI Tools */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4 text-emerald-600">
              <Bot size={28} />
              <h3 className="text-xl font-bold">{KEYWORD_CLUSTERS.aiTools.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4 min-h-[40px]">{KEYWORD_CLUSTERS.aiTools.description}</p>
            <div className="flex flex-wrap gap-2">
              {KEYWORD_CLUSTERS.aiTools.keywords.slice(0, 8).map((kw, idx) => (
                <a 
                  key={idx}
                  href={`#/${kw.replace(/\s+/g, '-')}`}
                  onClick={() => onNavigate(kw)}
                  className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {kw}
                </a>
              ))}
              <span className="text-xs text-emerald-500 px-2 py-1 cursor-pointer">المزيد...</span>
            </div>
          </div>
        </div>

        {/* Directory List (SEO Goldmine) */}
        <div className="border-t border-gray-200 pt-8">
            <h4 className="text-sm font-bold text-gray-900 mb-4">الدليل الشامل (Directory)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
                {[
                  ...KEYWORD_CLUSTERS.pdfTools.keywords, 
                  ...(KEYWORD_CLUSTERS.conversionTools?.keywords || []), 
                  ...KEYWORD_CLUSTERS.aiTools.keywords
                ].map((kw, i) => (
                    <a 
                        key={i} 
                        href={`#/${kw.replace(/\s+/g, '-')}`}
                        onClick={() => onNavigate(kw)}
                        className="text-xs text-gray-500 hover:text-primary-600 hover:underline truncate block"
                        title={kw}
                    >
                        {kw}
                    </a>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default SeoEmpire;
