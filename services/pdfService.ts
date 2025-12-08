import * as pdfjsLib from 'pdfjs-dist';

// We need to set the worker source. Since we are in a no-bundler/ESM environment for the worker usually,
// we point to a CDN that matches the version.
// Switching to jsDelivr as it reliably mirrors npm versions and paths compared to cdnjs.
// Using explicit version matching.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export const extractTextFromPdf = async (
  file: File,
  onProgress: (progress: number) => void
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const items = (textContent.items as any[]).filter(item => item.str !== undefined);
    const styles = textContent.styles;
    
    let pageText = '';
    let lastY = -1;
    let lastX = -1;

    for (const item of items) {
      const str = item.str;
      // Skip whitespace-only items that are often just spacing adjustments, 
      // but track their position to ensure correct spacing for next items.
      if (!str || !str.trim()) {
         if (item.transform && item.transform.length >= 6) {
            lastX = item.transform[4] + (item.width || 0);
            lastY = item.transform[5];
         }
         continue;
      }

      let text = str;

      // --- 1. Formatting Detection ---
      if (item.fontName) {
        const style = styles[item.fontName];
        // Combine font family and font name to check for style keywords
        const fontStr = ((style?.fontFamily || '') + (item.fontName || '')).toLowerCase();
        
        const isBold = fontStr.includes('bold') || fontStr.includes('black') || fontStr.includes('heavy') || fontStr.includes('bd');
        const isItalic = fontStr.includes('italic') || fontStr.includes('oblique') || fontStr.includes('it');
        
        if (isBold && isItalic) text = `***${text}***`;
        else if (isBold) text = `**${text}**`;
        else if (isItalic) text = `*${text}*`;
      }

      // --- 2. Layout & Spacing Preservation ---
      let prefix = '';
      if (item.transform && item.transform.length >= 6) {
        const x = item.transform[4];
        const y = item.transform[5];
        const h = Math.abs(item.transform[3]); // Approx font height (scaleY)

        if (lastY !== -1) {
           const dy = Math.abs(y - lastY);
           // If significant vertical change (> 60% of font height), treat as New Line
           if (dy > h * 0.6) {
             prefix = '\n';
           } else {
             // Same line, check for horizontal gap
             const dx = x - lastX;
             // If large gap (> 2 chars width), treat as Tab/Column break
             if (dx > h * 2) {
               prefix = '\t';
             } else if (dx > h * 0.2) {
               // Standard word spacing
               prefix = ' ';
             }
           }
        }
        
        lastX = x + (item.width || 0);
        lastY = y;
      } else {
         // Fallback if no transform info is available
         prefix = ' '; 
      }
      
      pageText += prefix + text;
    }
    
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    
    // Update progress
    const progress = Math.floor((i / numPages) * 100);
    onProgress(progress);
  }

  return fullText;
};
