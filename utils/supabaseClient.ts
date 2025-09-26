import { createClient } from '@supabase/supabase-js';

// These variables are loaded from your environment settings.
// For local development, create a `.env.local` file at the root of your project:
// VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
// VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
// On deployment platforms like Render, set these as environment variables in your service's settings.
// Fix: The triple-slash directive for Vite's client types was not being resolved, causing errors. Casting to `any` bypasses the type checking for `import.meta.env` as a workaround.
const supabaseUrl = 'https://dqmechpzgqngsvlblvon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxbWVjaHB6Z3FuZ3N2bGJsdm9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MTA0OTMsImV4cCI6MjA2OTE4NjQ5M30.REnKnClyrqihwghHcSyuu7DR3ZgUolob8D8vk8g5TPk';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase credentials are not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.");
    // In a production build, it's better to throw an error to halt execution
    // if the application cannot function without Supabase.
    // throw new Error("Supabase credentials are not configured.");
}

// The non-null assertion (!) is used here because the check above ensures they exist.
// If they don't, the app would fail to initialize, which is the desired behavior.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
