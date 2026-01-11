import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2?module'

const SUPABASE_URL = 'https://PROJECT_KAMU.supabase.co'; // GANTI DENGAN URL KAMU
const SUPABASE_KEY = 'KEY_ANON_KAMU'; // GANTI DENGAN KEY KAMU

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

