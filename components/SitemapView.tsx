
import React from 'react';
import { KEYWORD_CLUSTERS } from '../utils/seoConstants';
import { Map, ArrowLeft } from 'lucide-react';

interface SitemapViewProps {
  onNavigate: (keyword: string) => void;
  onBack: () => void;
}

const SitemapView: React.FC<SitemapViewProps> = ({ onNavigate, onBack }) => {
  return (
    <div className="container mx-auto px-4 py-8 animate-in fade-in">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-primary-600 hover:underline font-bold"
      >
        <ArrowLeft size={20} />
        العودة للرئيسية
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-8 border-b pb-4">
          <Map className="text-primary-600" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">خريطة الموقع (Sitemap)</h1>
            <p className="text-gray-500">دليل شامل لجميع الأدوات والمواضيع المتاحة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {Object.entries(KEYWORD_CLUSTERS).map(([key, cluster]) => (
            <div key={key} className="space-y-4">
              <h2 className="text-xl font-bold text-gray-800 border-r-4 border-primary-500 pr-3">
                {cluster.title}
              </h2>
              <p className="text-sm text-gray-500">{cluster.description}</p>
              <ul className="space-y-2">
                {cluster.keywords.map((kw, idx) => (
                  <li key={idx}>
                    <a 
                      href={`#/${kw.replace(/\s+/g, '-')}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(kw);
                      }}
                      className="text-blue-600 hover:text-blue-800 hover:underline text-sm block py-1 border-b border-gray-50 last:border-0"
                    >
                      {kw}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapView;
