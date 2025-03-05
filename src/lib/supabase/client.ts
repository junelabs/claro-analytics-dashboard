
import { createClient } from '@supabase/supabase-js';

// These environment variables are automatically provided when Supabase is connected
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a mock client for development when credentials are missing
const isMissingCredentials = !supabaseUrl || !supabaseKey;

if (isMissingCredentials) {
  console.warn('Supabase credentials missing in environment. Using mock implementation for development.');
  console.warn('For production tracking, please use the integration client from @/integrations/supabase/client');
}

// Create client with fallback for development
export const supabase = isMissingCredentials 
  ? createMockClient() 
  : createClient(supabaseUrl, supabaseKey);

// Create a mock client that doesn't throw errors during development
function createMockClient() {
  return {
    from: () => ({
      insert: () => Promise.resolve({ data: null, error: null }),
      select: () => ({
        eq: () => ({
          gte: () => Promise.resolve({ data: [], error: null })
        }),
        gte: () => Promise.resolve({ data: [], error: null })
      }),
    }),
  } as any;
}
