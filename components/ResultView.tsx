import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AnalysisResult, ChatMessage } from '../types';
import { Book, FileText, HelpCircle, Download, Printer, MessageCircle, Send, User, Bot, Sparkles, Copy, Check, FileDown, Layers, Calendar, ChevronRight, ChevronLeft, RotateCw, Volume2, StopCircle, Settings, Sun, Moon, Coffee, Type, Search, X, Image as ImageIcon, Table as TableIcon } from 'lucide-react';
import { initChatSession, sendMessageToChat } from '../services/geminiService';
import * as docx from 'docx';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as htmlToImage from 'html-to-image';

interface ResultViewProps {
  result: AnalysisResult;
  apiKey: string;
  originalText: string;
}

type Theme = 'light' | 'dark' | 'sepia';
type FontSize = 'sm' | 'base' | 'lg';

const ResultView: React.FC<ResultViewProps> = ({ result, apiKey, originalText }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'summary' | 'flashcards' | 'plan' | 'qa' | 'chat'>('summary');
  const [copied, setCopied] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  
  // Appearance State
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Text-to-Speech State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
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
    synthRef.current = window.speechSynthesis;
    
    return () => {
       if (synthRef.current && isSpeaking) {
         synthRef.current.cancel();
       }
    };
  }, [apiKey, originalText]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close settings on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // --- Search & Highlight Logic ---
  
  const highlightText = (text: string, query: string) => {
    if (!text) return "";
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark 
          key={index} 
          className={`rounded-sm px-0.5 font-bold ${theme === 'dark' ? 'bg-yellow-600 text-white' : 'bg-yellow-300 text-black'}`}
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Component to render highlighted simple text
  const Highlightable: React.FC<{ text: string }> = ({ text }) => {
    return <>{highlightText(text, searchQuery)}</>;
  };

  // Custom Markdown Components for highlighting and color boxes
  const markdownComponents = useMemo(() => {
    const processChildren = (children: React.ReactNode): React.ReactNode => {
      return React.Children.map(children, child => {
        if (typeof child === 'string') {
          return highlightText(child, searchQuery);
        }
        if (React.isValidElement(child) && (child.type === 'strong' || child.type === 'em' || child.type === 'span')) {
           return child;
        }
        return child;
      });
    };

    // Helper to get text content from React Node to check for emojis
    const getTextContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(getTextContent).join('');
        if (React.isValidElement(node) && node.props.children) return getTextContent(node.props.children);
        return '';
    };

    return {
      p: ({ children, ...props }: any) => <p {...props}>{processChildren(children)}</p>,
      li: ({ children, ...props }: any) => <li {...props}>{processChildren(children)}</li>,
      h1: ({ children, ...props }: any) => <h1 {...props}>{processChildren(children)}</h1>,
      h2: ({ children, ...props }: any) => <h2 {...props}>{processChildren(children)}</h2>,
      h3: ({ children, ...props }: any) => <h3 {...props}>{processChildren(children)}</h3>,
      h4: ({ children, ...props }: any) => <h4 {...props}>{processChildren(children)}</h4>,
      
      // Custom Table for better styling
      table: ({ children, ...props }: any) => (
        <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
           <table className={`min-w-full divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`} {...props}>
             {children}
           </table>
        </div>
      ),
      thead: ({ children, ...props }: any) => (
         <thead className={theme === 'dark' ? 'bg-gray-800' : theme === 'sepia' ? 'bg-[#e3dcc5]' : 'bg-gray-50'} {...props}>{children}</thead>
      ),
      tbody: ({ children, ...props }: any) => (
         <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'}`} {...props}>{children}</tbody>
      ),
      tr: ({ children, ...props }: any) => (
         <tr className={`${theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'}`} {...props}>{children}</tr>
      ),
      td: ({ children, ...props }: any) => (
         <td className="px-4 py-3 whitespace-pre-wrap text-sm" {...props}>{processChildren(children)}</td>
      ),
      th: ({ children, ...props }: any) => (
         <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider" {...props}>{processChildren(children)}</th>
      ),

      // Custom Blockquote Renderer for Color Boxes
      blockquote: ({ children, ...props }: any) => {
        const text = getTextContent(children);
        let className = `border-r-4 p-4 rounded-lg my-4 shadow-sm `;
        let icon = null;

        if (text.includes('🔴')) {
            className += theme === 'dark' ? 'bg-red-900/20 border-red-500 text-red-200' : 'bg-red-50 border-red-500 text-red-800';
        } else if (text.includes('🟢')) {
            className += theme === 'dark' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-200' : 'bg-green-50 border-green-500 text-green-800';
        } else if (text.includes('💡')) {
            className += theme === 'dark' ? 'bg-amber-900/20 border-amber-500 text-amber-200' : 'bg-yellow-50 border-yellow-500 text-yellow-800';
        } else if (text.includes('⚠️')) {
            className += theme === 'dark' ? 'bg-orange-900/20 border-orange-500 text-orange-200' : 'bg-orange-50 border-orange-500 text-orange-800';
        } else {
            className += theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-300' : theme === 'sepia' ? 'bg-[#e8e0cc] border-[#a8a29e] text-[#5c4b37]' : 'bg-gray-50 border-gray-300 text-gray-700';
        }

        return (
            <div className={className} dir="auto">
               {children}
            </div>
        );
      },
      
      strong: ({ children, ...props }: any) => <strong {...props}>{processChildren(children)}</strong>,
      em: ({ children, ...props }: any) => <em {...props}>{processChildren(children)}</em>,
    };
  }, [searchQuery, theme]);


  // --- TTS Logic ---
  const toggleSpeech = () => {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = result.summary.replace(/[#*`]/g, ''); 
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      // Attempt to auto-detect language from metadata or text content
      const isArabic = /[\u0600-\u06FF]/.test(textToRead.substring(0, 50));
      utterance.lang = isArabic ? 'ar-SA' : 'en-US';
      
      utterance.rate = 1.0;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      synthRef.current?.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // --- EXPORT LOGIC ---

  const handleExportExcel = () => {
    if (activeTab === 'plan' && result.studyPlan) {
      const ws = XLSX.utils.json_to_sheet(result.studyPlan.map(item => ({
        "الوقت/اليوم": item.day,
        "المهام المطلوبة": item.tasks.join(" - ")
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Study Plan");
      XLSX.writeFile(wb, "StudyPlan.xlsx");
    } else if (activeTab === 'flashcards' && result.flashcards) {
       const ws = XLSX.utils.json_to_sheet(result.flashcards.map(card => ({
        "السؤال/المصطلح": card.front,
        "الإجابة/التعريف": card.back
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Flashcards");
      XLSX.writeFile(wb, "Flashcards.xlsx");
    }
  };

  const handleDownloadImage = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current, { backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' });
        const link = document.createElement('a');
        link.download = `flashcard_${currentCardIndex + 1}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download image', err);
        alert('حدث خطأ أثناء تحميل الصورة.');
      }
    }
  };

  // --- DOCX GENERATION LOGIC ---
  const generateWordDocument = async () => {
    setIsGeneratingDoc(true);
    try {
      const docxLib = (docx as any).default || docx;
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, AlignmentType, ShadingType } = docxLib;

      const getColorFromText = (text: string): string => {
        if (text.includes('🔴')) return "D32F2F";
        if (text.includes('🟢')) return "388E3C";
        if (text.includes('💡')) return "FBC02D";
        if (text.includes('⚠️')) return "E64A19";
        return "000000";
      };

      const parseMarkdownToDocx = (markdown: string): any[] => {
        const lines = markdown.split('\n');
        const children: any[] = [];
        let inTable = false;
        let tableRows: any[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (line.startsWith('|')) {
             if (!inTable) {
               inTable = true;
               tableRows = [];
             }
             const cells = line.split('|').filter(c => c.trim() !== '').map(c => c.trim());
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
               children.push(new Paragraph({ text: "" })); 
             }
             inTable = false;
             tableRows = [];
          }

          if (line === '') {
            children.push(new Paragraph({ text: "" }));
            continue;
          }

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
          else if (line.startsWith('>')) {
            // Blockquote handling for Word
            const text = line.replace('>', '').trim();
            const color = getColorFromText(text);
            let shadeColor = "FFFFFF";
            if (text.includes('🔴')) shadeColor = "FFEBEE"; // Light Red
            else if (text.includes('🟢')) shadeColor = "E8F5E9"; // Light Green
            else if (text.includes('💡')) shadeColor = "FFFDE7"; // Light Yellow

            children.push(new Paragraph({
               children: [new TextRun({ 
                 text: text, 
                 color: color, 
                 font: "Tajawal",
                 size: 24
               })],
               shading: { fill: shadeColor, type: ShadingType.CLEAR },
               border: { left: { style: BorderStyle.SINGLE, size: 6, color: color !== "000000" ? color : "888888" } },
               indent: { left: 300 },
               spacing: { after: 120 },
               bidirectional: true
             }));
          }
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

      // ... (Rest of Word generation logic remains similar, relying on parseMarkdownToDocx)
      // Re-using the logic from previous implementation but with better blockquote support above.

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
                    children: [new TextRun({ text: "المادة الدراسية", font: "Tajawal", size: 20, color: "3B82F6" })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.subject, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "EFF6FF" },
                verticalAlign: AlignmentType.CENTER,
                borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" }, left: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" }, right: { style: BorderStyle.SINGLE, size: 1, color: "BFDBFE" } }
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "المرحلة", font: "Tajawal", size: 20, color: "9333EA" })],
                    alignment: AlignmentType.CENTER,
                  }),
                  new Paragraph({
                    children: [new TextRun({ text: result.metadata.stage, font: "Tajawal", size: 28, bold: true })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                shading: { fill: "FAF5FF" },
                verticalAlign: AlignmentType.CENTER,
                borders: { top: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" }, bottom: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" }, left: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" }, right: { style: BorderStyle.SINGLE, size: 1, color: "E9D5FF" } }
              }),
            ],
          }),
        ],
      });

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({ text: `تقرير المُلخص الذكي - ${result.metadata.subject}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, bidirectional: true }),
            new Paragraph({ text: "" }),
            metadataTable,
            new Paragraph({ text: "" }),
            ...parseMarkdownToDocx(result.summary),
            new Paragraph({ text: "", pageBreakBefore: true }),
            new Paragraph({ text: "بنك الأسئلة الشامل", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER, bidirectional: true }),
            ...parseMarkdownToDocx(result.qaBank),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const saveAs = (FileSaver as any).saveAs || (FileSaver as any).default || FileSaver;
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
    // Add user message to state
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await sendMessageToChat(userMsg);
      // Ensure response is valid string
      const safeResponse = typeof response === 'string' ? response : "عذراً، حدث خطأ في تنسيق الاستجابة.";
      setMessages(prev => [...prev, { role: 'model', text: safeResponse }]);
    } catch (error) {
      console.error("Chat Error Handled:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'عذراً، حدث خطأ في الاتصال أو انتهت الجلسة. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
        setCurrentCardIndex((prev) => (prev + 1) % (result.flashcards?.length || 1));
    }, 200);
  };

  const prevCard = () => {
    setIsFlipped(false);
     setTimeout(() => {
        setCurrentCardIndex((prev) => (prev - 1 + (result.flashcards?.length || 1)) % (result.flashcards?.length || 1));
    }, 200);
  };

  // --- APPEARANCE UTILS ---
  const containerClasses = {
    light: 'bg-white text-gray-900 border-gray-100',
    dark: 'bg-gray-900 text-gray-100 border-gray-700',
    sepia: 'bg-[#f4ecd8] text-[#5c4b37] border-[#d3cbb1]',
  }[theme];

  const toolbarClasses = {
    light: 'bg-gray-50 border-gray-200',
    dark: 'bg-gray-800 border-gray-700',
    sepia: 'bg-[#e3dcc5] border-[#d3cbb1]',
  }[theme];

  const buttonClasses = (isActive: boolean) => {
    if (theme === 'light') return isActive ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-100';
    if (theme === 'dark') return isActive ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-700 hover:text-gray-200';
    if (theme === 'sepia') return isActive ? 'bg-[#d6cbb1] text-[#433422] shadow-sm' : 'text-[#8c7b66] hover:bg-[#d6cbb1]/50';
    return '';
  };

  const proseClass = {
    light: 'prose-indigo',
    dark: 'prose-invert',
    sepia: 'prose-stone',
  }[theme];

  const sizeClass = {
    sm: 'prose-sm',
    base: 'prose-base',
    lg: 'prose-lg',
  }[fontSize];

  // Helper for Info Cards in Dark/Sepia
  const getInfoCardStyle = (color: string) => {
    const base = "p-4 rounded-xl border";
    if (theme === 'dark') {
      const darkColors: any = {
        blue: 'bg-gray-800 border-blue-900/50 text-blue-300',
        purple: 'bg-gray-800 border-purple-900/50 text-purple-300',
        green: 'bg-gray-800 border-green-900/50 text-green-300',
        orange: 'bg-gray-800 border-orange-900/50 text-orange-300',
      };
      return `${base} ${darkColors[color]}`;
    }
    if (theme === 'sepia') {
      const sepiaColors: any = {
        blue: 'bg-[#e8e0cc] border-[#d6cbb1] text-[#5c4b37]',
        purple: 'bg-[#e8e0cc] border-[#d6cbb1] text-[#5c4b37]',
        green: 'bg-[#e8e0cc] border-[#d6cbb1] text-[#5c4b37]',
        orange: 'bg-[#e8e0cc] border-[#d6cbb1] text-[#5c4b37]',
      };
      return `${base} ${sepiaColors[color]}`;
    }
    // Light
    const lightColors: any = {
      blue: 'bg-blue-50 border-blue-100',
      purple: 'bg-purple-50 border-purple-100',
      green: 'bg-green-50 border-green-100',
      orange: 'bg-orange-50 border-orange-100',
    };
    return `${base} ${lightColors[color]}`;
  };

  return (
    <div className={`rounded-2xl shadow-xl overflow-hidden border flex flex-col h-full min-h-[600px] transition-colors duration-300 ${containerClasses}`}>
      
      {/* Toolbar */}
      <div className={`${toolbarClasses} border-b p-4 flex flex-col md:flex-row gap-4 items-center justify-between sticky top-0 z-20`}>
        <div className="flex bg-transparent rounded-lg p-1 overflow-x-auto max-w-full gap-1 order-2 md:order-1 w-full md:w-auto">
          <button onClick={() => setActiveTab('info')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'info')}`}>
            <Book size={16} />
            البيانات
          </button>
          <button onClick={() => setActiveTab('summary')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'summary')}`}>
            <FileText size={16} />
            كبسولة الامتحان
          </button>
           <button onClick={() => setActiveTab('flashcards')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'flashcards')}`}>
            <Layers size={16} />
            بطاقات
          </button>
           <button onClick={() => setActiveTab('plan')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'plan')}`}>
            <Calendar size={16} />
            الخطة
          </button>
          <button onClick={() => setActiveTab('qa')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'qa')}`}>
            <HelpCircle size={16} />
            الأسئلة
          </button>
          <button onClick={() => setActiveTab('chat')} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${buttonClasses(activeTab === 'chat')}`}>
            <MessageCircle size={16} />
            المساعد
          </button>
        </div>

        <div className="flex gap-2 items-center order-1 md:order-2 w-full md:w-auto justify-end">
           {/* Search Bar */}
           {activeTab !== 'chat' && (
              <div className="relative flex-grow md:flex-grow-0 max-w-[200px]">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all focus-within:ring-2 focus-within:ring-primary-500 ${theme === 'dark' ? 'bg-gray-900 border-gray-600' : 'bg-white border-gray-300'}`}>
                   <Search size={16} className="text-gray-400" />
                   <input 
                    type="text" 
                    placeholder="بحث..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm min-w-[60px]"
                   />
                   {searchQuery && (
                     <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                       <X size={14} />
                     </button>
                   )}
                </div>
              </div>
           )}

           {/* Appearance Settings */}
           <div className="relative" ref={settingsRef}>
             <button 
               onClick={() => setShowSettings(!showSettings)} 
               className={`p-2 rounded-lg transition-colors border border-transparent ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-white hover:border-gray-200'}`} 
               title="إعدادات العرض"
             >
               <Settings size={20} />
             </button>
             
             {showSettings && (
               <div className={`absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                 <div className="mb-4">
                   <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>الوضع (Theme)</label>
                   <div className="flex gap-2">
                     <button onClick={() => setTheme('light')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 ${theme === 'light' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Sun size={16} /> <span className="text-xs">فاتح</span>
                     </button>
                     <button onClick={() => setTheme('dark')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 ${theme === 'dark' ? 'bg-gray-700 border-gray-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Moon size={16} /> <span className="text-xs">داكن</span>
                     </button>
                     <button onClick={() => setTheme('sepia')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center gap-2 ${theme === 'sepia' ? 'bg-[#f4ecd8] border-[#d3cbb1] text-[#5c4b37]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Coffee size={16} /> <span className="text-xs">ورقي</span>
                     </button>
                   </div>
                 </div>
                 
                 <div>
                   <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>حجم الخط</label>
                   <div className="flex gap-2">
                     <button onClick={() => setFontSize('sm')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center ${fontSize === 'sm' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Type size={14} />
                     </button>
                     <button onClick={() => setFontSize('base')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center ${fontSize === 'base' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Type size={18} />
                     </button>
                     <button onClick={() => setFontSize('lg')} className={`flex-1 p-2 rounded-lg border flex items-center justify-center ${fontSize === 'lg' ? 'bg-primary-50 border-primary-500 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                       <Type size={22} />
                     </button>
                   </div>
                 </div>
               </div>
             )}
           </div>

           {/* Other Actions */}
           {activeTab !== 'chat' && (
             <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors border border-transparent hidden sm:block ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-primary-600 hover:bg-white hover:border-gray-200'}`} title="نسخ النص">
               {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
             </button>
           )}
           <button onClick={generateWordDocument} disabled={isGeneratingDoc} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm whitespace-nowrap" title="تحميل ملف Word منسق">
             {isGeneratingDoc ? <span className="animate-spin">⌛</span> : <FileDown size={18} />}
             <span className="hidden sm:inline">تحميل Word</span>
           </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-hidden relative">
        <div className="absolute inset-0 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className={`animate-in fade-in duration-300 max-w-4xl mx-auto`} dir="auto">
              <h2 className={`text-2xl font-bold mb-6 border-b pb-2 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>بيانات الكتاب المحللة</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className={getInfoCardStyle('blue')}>
                  <div className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} text-xs font-bold uppercase tracking-wider mb-1`}>المادة الدراسية</div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    <Highlightable text={result.metadata.subject} />
                  </div>
                </div>
                <div className={getInfoCardStyle('purple')}>
                  <div className={`${theme === 'dark' ? 'text-purple-400' : 'text-purple-500'} text-xs font-bold uppercase tracking-wider mb-1`}>المرحلة</div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    <Highlightable text={result.metadata.stage} />
                  </div>
                </div>
                <div className={getInfoCardStyle('green')}>
                  <div className={`${theme === 'dark' ? 'text-green-400' : 'text-green-500'} text-xs font-bold uppercase tracking-wider mb-1`}>المنهج</div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                     <Highlightable text={result.metadata.curriculum} />
                  </div>
                </div>
                <div className={getInfoCardStyle('orange')}>
                  <div className={`${theme === 'dark' ? 'text-orange-400' : 'text-orange-500'} text-xs font-bold uppercase tracking-wider mb-1`}>لغة الكتاب</div>
                  <div className={`text-xl font-bold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
                    <Highlightable text={result.metadata.language} />
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-6 border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : theme === 'sepia' ? 'bg-[#e8e0cc] border-[#d6cbb1]' : 'bg-gray-50 border-gray-100'}`}>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-yellow-500"/>
                  نظرة عامة شاملة
                </h3>
                <p className={`leading-relaxed ${fontSize === 'lg' ? 'text-xl' : fontSize === 'sm' ? 'text-sm' : 'text-lg'}`}>
                  <Highlightable text={result.metadata.overview} />
                </p>
              </div>
            </div>
          )}

          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto markdown-body" dir="auto">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">الملخص الشامل</h2>
                 <button 
                  onClick={toggleSpeech}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isSpeaking ? 'bg-red-100 text-red-600 animate-pulse' : theme === 'dark' ? 'bg-gray-800 text-primary-400 hover:bg-gray-700' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'}`}
                 >
                   {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
                   {isSpeaking ? 'إيقاف القراءة' : 'استمع للملخص'}
                 </button>
              </div>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                className={`prose ${proseClass} ${sizeClass} max-w-none`}
                components={markdownComponents}
              >
                {result.summary}
              </ReactMarkdown>
            </div>
          )}

           {/* Flashcards Tab */}
          {activeTab === 'flashcards' && (
             <div className="animate-in fade-in duration-300 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px]" dir="auto">
               <div className="w-full flex justify-end gap-2 mb-4">
                 <button onClick={handleDownloadImage} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} title="تحميل البطاقة كصورة">
                   <ImageIcon size={14} />
                   صورة
                 </button>
                  <button onClick={handleExportExcel} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`} title="تصدير الكل لملف Excel">
                   <TableIcon size={14} />
                   Excel
                 </button>
               </div>

               {result.flashcards && result.flashcards.length > 0 ? (
                 <>
                    <div className="relative w-full aspect-[1.6] perspective-1000 mb-8 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                       <div className={`relative w-full h-full text-center transition-transform duration-700 transform-style-3d shadow-xl rounded-2xl ${isFlipped ? 'rotate-y-180' : ''}`} ref={cardRef}>
                          {/* Front */}
                          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-8 flex flex-col items-center justify-center border-2 border-primary-400">
                             <h3 className="text-lg font-medium opacity-80 mb-4">المصطلح / السؤال</h3>
                             <p className="text-3xl font-bold leading-tight">
                                <Highlightable text={result.flashcards[currentCardIndex].front} />
                             </p>
                             <div className="mt-8 text-sm opacity-70 flex items-center gap-2 dont-print">
                               <RotateCw size={14} />
                               اضغط للقلب
                             </div>
                          </div>
                          {/* Back */}
                          <div className={`absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl p-8 flex flex-col items-center justify-center border-2 ${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white text-gray-800 border-gray-200'}`}>
                             <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>التعريف / الإجابة</h3>
                             <p className="text-xl leading-relaxed font-medium">
                               <Highlightable text={result.flashcards[currentCardIndex].back} />
                             </p>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-center gap-6">
                       <button onClick={prevCard} className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                         <ChevronRight size={24} />
                       </button>
                       <span className="font-bold opacity-70">
                          {currentCardIndex + 1} / {result.flashcards.length}
                       </span>
                       <button onClick={nextCard} className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}>
                         <ChevronLeft size={24} />
                       </button>
                    </div>
                 </>
               ) : (
                 <div className="text-center opacity-50">
                   <Layers size={48} className="mx-auto mb-4 opacity-20" />
                   <p>لم يتم توليد بطاقات لهذا المحتوى.</p>
                 </div>
               )}
             </div>
          )}

          {/* Study Plan Tab */}
          {activeTab === 'plan' && (
             <div className="animate-in fade-in duration-300 max-w-3xl mx-auto" dir="auto">
               <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold flex items-center gap-3">
                   <Calendar className="text-primary-600" />
                   خطة المذاكرة المقترحة
                 </h2>
                 <button onClick={handleExportExcel} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-50'}`}>
                   <TableIcon size={14} />
                   تصدير Excel
                 </button>
               </div>
               
               {result.studyPlan && result.studyPlan.length > 0 ? (
                 <div className="relative border-r-2 border-primary-200 mr-4 space-y-12">
                   {result.studyPlan.map((item, idx) => (
                     <div key={idx} className="relative pr-8">
                       <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-primary-500 ring-4 ring-primary-100"></div>
                       <h3 className="text-xl font-bold text-primary-700 mb-3">{item.day}</h3>
                       <ul className="space-y-3">
                         {item.tasks.map((task, tIdx) => (
                           <li key={tIdx} className={`p-4 rounded-lg border flex gap-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : theme === 'sepia' ? 'bg-[#e8e0cc] border-[#d6cbb1] text-[#5c4b37]' : 'bg-gray-50 border-gray-100 text-gray-700'}`}>
                              <Check size={18} className="text-green-500 mt-1 flex-shrink-0" />
                              <span className={fontSize === 'lg' ? 'text-lg' : fontSize === 'sm' ? 'text-sm' : ''}>
                                <Highlightable text={task} />
                              </span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   ))}
                 </div>
               ) : (
                 <p className="text-center opacity-50">لا توجد خطة مذاكرة متاحة.</p>
               )}
             </div>
          )}

          {/* Q&A Tab */}
          {activeTab === 'qa' && (
            <div className="animate-in fade-in duration-300 max-w-4xl mx-auto markdown-body" dir="auto">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]} 
                className={`prose ${proseClass} ${sizeClass} max-w-none`}
                components={markdownComponents}
              >
                {result.qaBank}
              </ReactMarkdown>
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
             <div className="flex flex-col h-full max-w-3xl mx-auto animate-in fade-in duration-300" dir="auto">
               <div className="flex-grow space-y-4 pb-20">
                 {messages.map((msg, idx) => (
                   <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-secondary-500 text-white'}`}>
                       {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                     </div>
                     <div className={`p-4 rounded-2xl max-w-[80%] ${
                        msg.role === 'user' 
                          ? 'bg-primary-50 text-gray-800 rounded-tr-none' 
                          : theme === 'dark'
                            ? 'bg-gray-700 text-gray-100 border-gray-600 border shadow-sm rounded-tl-none'
                            : theme === 'sepia'
                                ? 'bg-[#e8e0cc] text-[#5c4b37] border-[#d6cbb1] border shadow-sm rounded-tl-none'
                                : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-none'
                     }`}>
                       <ReactMarkdown className={`prose prose-sm max-w-none ${theme === 'dark' && msg.role !== 'user' ? 'prose-invert' : ''}`}>
                         {typeof msg.text === 'string' ? msg.text : ''}
                       </ReactMarkdown>
                     </div>
                   </div>
                 ))}
                 {isChatLoading && (
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0">
                        <Bot size={16} />
                      </div>
                      <div className={`border shadow-sm p-4 rounded-2xl rounded-tl-none ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
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

               <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${theme === 'dark' ? 'bg-gray-900/90 border-gray-800' : theme === 'sepia' ? 'bg-[#f4ecd8]/90 border-[#d3cbb1]' : 'bg-white/90 border-gray-200'} backdrop-blur-sm`}>
                 <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto relative">
                   <input
                     type="text"
                     value={inputMessage}
                     onChange={(e) => setInputMessage(e.target.value)}
                     placeholder="اسأل المساعد الذكي عن أي شيء في الكتاب..."
                     className={`w-full pl-12 pr-4 py-3 border rounded-xl outline-none transition-all shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-primary-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:ring-primary-500'}`}
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