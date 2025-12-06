import * as pdfjsLib from 'pdfjs-dist';

// We need to set the worker source. Since we are in a no-bundler/ESM environment for the worker usually,
// we point to a CDN that matches the version.
// Switching to jsDelivr as it reliably mirrors npm versions and paths compared to cdnjs.
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
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += `--- Page ${i} ---\n${pageText}\n\n`;
    
    // Update progress
    const progress = Math.floor((i / numPages) * 100);
    onProgress(progress);
  }

  return fullText;
};