import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalysisResult, ChatMessage } from '../types';
import { Book, FileText, HelpCircle, Download, Printer, MessageCircle, Send, User, Bot, Sparkles, Copy, Check, FileDown } from 'lucide-react';
import { initChatSession, sendMessageToChat } from '../services/geminiService';
import * as docx from 'docx';
import { saveAs } from 'file-saver';

interface ResultViewProps {
  result: AnalysisResult;
  apiKey: string;
  originalText: string;
}

const ResultView: React.FC<ResultViewProps> = ({ result, apiKey, originalText }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'summary' | 'qa' | 'chat'>('summary');
  const [copied, setCopied] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'أهلاً بك! أنا مساعدك الذكي لهذا الكتاب. يمكنك سؤالي عن أي نقطة غامضة، أو طلب شرح إضافي، أو حتى طلب اختبار سريع.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when component mounts
  useEffect(() => {
    if (apiKey && originalText) {
      initChatSession(apiKey, originalText);
    }
  }, [apiKey, originalText]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePrint = () => {
    window.print();
  };

  // --- DOCX GENERATION LOGIC ---
  const generateWordDocument = async () => {
    setIsGeneratingDoc(true);
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType } = docx;

      // Helper to determine color from emoji
      const getColorFromText = (text: string): string => {
        if (text.includes('🔴')) return "D32F2F"; // Red
        if (text.includes('🟢')) return "388E3C"; // Green
        if (text.includes('💡')) return "FBC02D"; // Yellow/Gold
        if (text.includes('⚠️')) return "E64A19"; // Orange
        return "000000";
      };

      // Simple Markdown parser for Docx
      const parseMarkdownToDocx = (markdown: string): any[] => {
        const lines = markdown.split('\n');
        const children: any[] = [];
        let inTable = false;
        let tableRows: any[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          // Table Handling
          if (line.startsWith('|')) {
             if (!inTable) {
               inTable = true;
               tableRows = [];
             }
             // Parse Row
             const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
             // Skip separator line |---|---|
             if (cells.some(c => c.includes('---'))) continue;

             const tableCells = cells.map(cellText => 
               new TableCell({
                 children: [new Paragraph({ 
                   children: [new TextRun({ text: cellText, size: 24, font: "Tajawal" })],
                   alignment: AlignmentType.CENTER
                 })],
                 verticalAlign: AlignmentType.CENTER,
                 margins: { top: 100, bottom: 100, left: 100, right: 100 },
               })
             );

             tableRows.push(new TableRow({ children: tableCells }));
             continue;
          } else if (inTable) {
             // End of table
             if (tableRows.length > 0) {
               children.push(new Table({
                 rows: tableRows,
                 width: { size: 100, type: WidthType.PERCENTAGE },
                 borders: {
                   top: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                   bottom: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                   left: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                   right: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
                   insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                   insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
                 }
               }));
               children.push(new Paragraph({ text: "" })); // Spacing
             }
             inTable = false;
             tableRows = [];
          }

          if (line === '') {
            children.push(new Paragraph({ text: "" }));
            continue;
          }

          // Headings
          if (line.startsWith('# ')) {
            children.push(new Paragraph({
              text: line.replace('# ', ''),
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
              bidirectional: true
            }));
          } else if (line.startsWith('## ')) {
             children.push(new Paragraph({
              text: line.replace('## ', ''),
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
              bidirectional: true
            }));
          } else if (line.startsWith('### ')) {
             children.push(new Paragraph({
              text: line.replace('### ', ''),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
              bidirectional: true
            }));
          } 
          // List Items
          else if (line.startsWith('- ') || line.startsWith('* ')) {
             const text = line.replace(/^[-*] /, '');
             const color = getColorFromText(text);
             children.push(new Paragraph({
               children: [new TextRun({ 
                 text: text, 
                 color: color, 
                 bold: color !== "000000",
                 font: "Tajawal",
                 size: 24 
               })],
               bullet: { level: 0 },
               bidirectional: true
             }));
          }
          // Normal Text
          else {
            const color = getColorFromText(line);
            children.push(new Paragraph({
               children: [new TextRun({ 
                 text: line, 
                 color: color,
                 bold: line.includes('**') || color !== "000000",
                 font: "Tajawal",
                 size: 24
               })],
               spacing: { after: 120 },
               bidirectional: true
             }));
          }
        }
        
        // Catch trailing table
        if (inTable && tableRows.length > 0) {
           children.push(new Table({
             rows: tableRows,
             width: { size: 100, type: WidthType.PERCENTAGE },
             borders: {
               top: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
               bottom: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
               left: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
               right: { style: BorderStyle.SINGLE, size: 1, color: "888888" },
               insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
               insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
             }
           }));
        }

        return children;
      };

      // Construct Metadata Table (Formatted 2x2 Grid)
      const metadataTable = new Table({
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "المادة الدراسية", font: "Tajawal", size: 20, color: "3B82F6" })], // blue-500
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.subject, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "EFF6FF" }, // blue-50
                verticalAlign: AlignmentType.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" },
                }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "المرحلة", font: "Tajawal", size: 20, color: "9333EA" })], // purple-600
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.stage, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "FAF5FF" }, // purple-50
                verticalAlign: AlignmentType.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                 borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" },
                }
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "المنهج", font: "Tajawal", size: 20, color: "16A34A" })], // green-600
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.curriculum, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "F0FDF4" }, // green-50
                verticalAlign: AlignmentType.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                 borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "BBF7D0" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "BBF7D0" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "BBF7D0" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "BBF7D0" },
                }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "لغة الكتاب", font: "Tajawal", size: 20, color: "EA580C" })], // orange-600
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.language, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "FFF7ED" }, // orange-50
                verticalAlign: AlignmentType.CENTER,
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                 borders: {
                    top: { style: BorderStyle.SINGLE, size: 1, color: "FED7AA" },
                    bottom: { style: BorderStyle.SINGLE, size: 1, color: "FED7AA" },
                    left: { style: BorderStyle.SINGLE, size: 1, color: "FED7AA" },
                    right: { style: BorderStyle.SINGLE, size: 1, color: "FED7AA" },
                }
              }),
            ],
          }),
        ],
      });

      // Construct Sections
      const infoChildren = [
        new Paragraph({ 
          text: `تقرير المُلخص الذكي - ${result.metadata.subject}`, 
          heading: HeadingLevel.HEADING_1, 
          alignment: AlignmentType.CENTER,
          bidirectional: true 
        }),
        new Paragraph({ text: "" }),
        // Replaced plain text list with formatted table
        metadataTable,
        new Paragraph({ text: "" }),
        new Paragraph({ text: "نظرة عامة:", heading: HeadingLevel.HEADING_2, bidirectional: true }),
        new Paragraph({ text: result.metadata.overview, font: "Tajawal", size: 24, bidirectional: true }),
        new Paragraph({ text: "", pageBreakBefore: true }),
      ];

      const summaryChildren = [
        new Paragraph({ text: "الملخص (كبسولة الامتحان)", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, bidirectional: true }),
        ...parseMarkdownToDocx(result.summary),
        new Paragraph({ text: "", pageBreakBefore: true }),
      ];

      const qaChildren = [
        new Paragraph({ text: "بنك الأسئلة الشامل", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, bidirectional: true }),
        ...parseMarkdownToDocx(result.qaBank),
      ];

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            ...infoChildren,
            ...summaryChildren,
            ...qaChildren
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${result.metadata.subject}_Exam_Capsule.docx`);

    } catch (e) {
      console.error("Word Generation Error", e);
      alert("حدث خطأ أثناء إنشاء ملف Word. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleCopy = () => {
    let contentToCopy = "";
    if (activeTab === 'summary') contentToCopy = result.summary;
    else if (activeTab === 'qa') contentToCopy = result.qaBank;
    else if (activeTab === 'info') contentToCopy = result.metadata.overview;

    if (contentToCopy) {
      navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await sendMessageToChat(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full min-h-[600px]">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-200 p-4 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10">
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm overflow-x-auto max-w-full">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'info' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Book size={16} />
            البيانات
          </button>
          <button 
            onClick={() => setActiveTab('summary')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'summary' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <FileText size={16} />
            كبسولة الامتحان
          </button>
          <button 
            onClick={() => setActiveTab('qa')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'qa' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <HelpCircle size={16} />
            بنك الأسئلة
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'chat' ? 'bg-secondary-50 text-secondary-600 shadow-sm ring-1 ring-secondary-100' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <MessageCircle size={16} />
            المساعد الذكي
          </button>
        </div>

        <div className="flex gap-2 hidden md:flex">
           {activeTab !== 'chat' && (
             <button onClick={handleCopy} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="نسخ النص">
               {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
             </button>
           )}
           <button onClick={generateWordDocument} disabled={isGeneratingDoc} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm" title="تحميل ملف Word منسق">
             {isGeneratingDoc ? <span className="animate-spin">⌛</span> : <FileDown size={18} />}
             <span>تحميل Word</span>
           </button>
           <button onClick={handlePrint} className="p-2 text-gray-600 hover:text-primary-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200" title="طباعة">
             <Printer size={20} />
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow bg-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">بيانات الكتاب المحللة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <div className="text-blue-500 text-xs font-bold uppercase tracking-wider mb-1">المادة الدراسية</div>
                  <div className="text-xl font-bold text-gray-900">{result.metadata.subject}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <div className="text-purple-500 text-xs font-bold uppercase tracking-wider mb-1">المرحلة</div>
                  <div className="text-xl font-bold text-gray-900">{result.metadata.stage}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="text-green-500 text-xs font-bold uppercase tracking-wider mb-1">المنهج</div>
                  <div className="text-xl font-bold text-gray-900">{result.metadata.curriculum}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                  <div className="text-orange-500 text-xs font-bold uppercase tracking-wider mb-1">لغة الكتاب</div>
                  <div className="text-xl font-bold text-gray-900">{result.metadata.language}</div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500"/>
                  نظرة عامة شاملة
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg">{result.metadata.overview}</p>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-lg prose-indigo max-w-none text-gray-800">
                {result.summary}
              </ReactMarkdown>
            </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-lg prose-indigo max-w-none text-gray-800">
                {result.qaBank}
              </ReactMarkdown>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
             <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in duration-300">
               <div className="flex-grow space-y-4 pb-20">
                 {messages.map((msg, idx) => (
                   <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-secondary-500 text-white'}`}>
                       {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                     </div>
                     <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-primary-50 text-gray-800 rounded-tr-none' : 'bg-white border border-gray-200 shadow-sm rounded-tl-none'}`}>
                       <ReactMarkdown className="prose prose-sm max-w-none">{msg.text}</ReactMarkdown>
                     </div>
                   </div>
                 ))}
                 {isChatLoading && (
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl rounded-tl-none">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                   </div>
                 )}
                 <div ref={messagesEndRef} />
               </div>

               <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200">
                 <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
                   <input
                     type="text"
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     placeholder="اسأل المساعد الذكي عن أي شيء في الكتاب..."
                     className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
                     disabled={isChatLoading}
                   />
                   <button 
                    type="submit" 
                    disabled={!inputMessage.trim() || isChatLoading}
                    className="absolute left-2 top-2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors"
                   >
                     <Send size={20} />
                   </button>
                 </form>
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultView;