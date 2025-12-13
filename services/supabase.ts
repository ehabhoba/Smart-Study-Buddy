
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lipnkwpotykkkgzozefn.supabase.co';
// WARNING: This is the ANON key (public). Do NOT put the Service Role key here.
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpcG5rd3BvdHlra2tnem96ZWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNTY2NjgsImV4cCI6MjA3NzgzMjY2OH0.pZZr8L7NU6wij-7fhjFaWrMnVF_B30DZITvEjSqvrQU';

export const supabase = createClient(supabaseUrl, supabaseKey);
