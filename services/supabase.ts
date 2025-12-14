
import { createClient } from '@supabase/supabase-js';

// Access environment variables injected by vite.config.ts
// We provide hardcoded fallbacks to prevent the "supabaseUrl is required" crash
// if the environment variables are not yet loaded or propagated.
const supabaseUrl = process.env.SUPABASE_URL || 'https://lipnkwpotykkkgzozefn.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcG5rd3BvdHlra2tnem96ZWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTY2NjgsImV4cCI6MjA3NzgzMjY2OH0.pZZr8L7NU6wij-7fhjFaWrMnVF_B30DZITvEjSqvrQU';

export const supabase = createClient(supabaseUrl, supabaseKey);
