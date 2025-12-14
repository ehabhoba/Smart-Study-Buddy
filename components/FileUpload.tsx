
import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndProcess(e.target.files[0]);
    }
  };

  const validateAndProcess = (file: File) => {
    // 1. Check if file exists
    if (!file) return;

    // 2. Check for empty file (Size validation)
    if (file.size === 0) {
      alert('عذراً، الملف الذي اخترته فارغ (0 bytes). يرجى التأكد من صلاحية الملف.');
      // Reset input to allow re-selecting if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Check MIME Type
    if (file.type !== 'application/pdf') {
      alert('تنسيق الملف غير مدعوم. يرجى رفع ملف بصيغة PDF فقط.');
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    
    onFileSelect(file);
  };

  return (
    <div 
      className={`
        relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
        ${isDragging ? 'border-primary-500 bg-primary-50 scale-[1.01]' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileInput} 
        accept="application/pdf" 
        className="hidden" 
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-500'}`}>
          <UploadCloud size={40} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">
             ارفع ملف المنهج هنا
          </h3>
          <p className="text-gray-500 text-sm">
            يمكنك سحب وإفلات الملف أو الضغط للاختيار (PDF فقط)
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
