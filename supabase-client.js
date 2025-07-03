import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// These variables will be provided by Vercel's Environment Variables.
const supabaseUrl = "https://eeyfzopydsgusqkvhsrr.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVleWZ6b3B5ZHNndXNxa3Zoc3JyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNzA4MjEsImV4cCI6MjA2NTg0NjgyMX0.N4zNst3g0Ab4qE1Ykwqqx9e8ZXGeyldN_f3AihMdfXk";

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);
