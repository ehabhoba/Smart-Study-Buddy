import React from 'react';
import { BookOpen, Key, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const Header: React.FC<HeaderProps> = ({ apiKey, setApiKey }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">المُلخص الذكي</h1>
            <p className="text-xs text-gray-500">Smart Study Buddy</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
              {apiKey ? <CheckCircle2 size={16} className="text-green-500" /> : <Key size={16} className="text-gray-400" />}
              <input 
                type="password" 
                placeholder="أدخل Gemini API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-40 md:w-64 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;