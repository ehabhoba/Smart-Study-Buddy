
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    build: {
      target: 'esnext',
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps in production for SEO security
      rollupOptions: {
        output: {
          manualChunks: {
            // Split heavy libraries into separate chunks to improve First Contentful Paint (SEO factor)
            'pdfjs': ['pdfjs-dist'],
            'genai': ['@google/genai'],
            'ui-vendor': ['lucide-react', 'react-markdown'],
            'react-vendor': ['react', 'react-dom'],
            'file-utils': ['docx', 'file-saver', 'xlsx', 'html-to-image']
          }
        }
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist', 'xlsx']
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL),
      'process.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY),
    }
  };
});
