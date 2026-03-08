import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (typeof window !== 'undefined' && (!supabaseUrl || supabaseUrl.includes('placeholder'))) {
    console.error("Supabase configuration error: NEXT_PUBLIC_SUPABASE_URL is missing or using placeholder. Ensure you have added the environment variables to Vercel AND performed a NEW DEPLOYMENT.");
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);
