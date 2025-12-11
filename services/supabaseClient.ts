
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzpbbyjdvppmlcalqwzu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cGJieWpkdnBwbWxjYWxxd3p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5OTY0NTAsImV4cCI6MjA4MDU3MjQ1MH0.swatWlvJi-BptE2AqKSPAdgfVs5B-dBVTaAhnGUmN40';

export const supabase = createClient(supabaseUrl, supabaseKey);
