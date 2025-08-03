import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null;

const getSupabaseClient = () => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if we're in a build environment with placeholder values
  const isBuildEnvironment = process.env.NODE_ENV === 'production' && 
    (!supabaseUrl || supabaseUrl.includes('placeholder') || 
     !supabaseAnonKey || supabaseAnonKey.includes('placeholder'));

  // Only throw error if we're not in a build environment
  if (!isBuildEnvironment && (!supabaseUrl || !supabaseAnonKey)) {
    throw new Error('Missing Supabase environment variables');
  }

  // Create a mock client for build environment
  if (isBuildEnvironment) {
    supabaseInstance = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null }),
        eq: () => Promise.resolve({ data: null, error: null }),
        in: () => Promise.resolve({ data: null, error: null }),
        order: () => Promise.resolve({ data: null, error: null }),
        limit: () => Promise.resolve({ data: null, error: null }),
        range: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      auth: {
        signUp: () => Promise.resolve({ data: null, error: null }),
        signInWithPassword: () => Promise.resolve({ data: null, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        resetPasswordForEmail: () => Promise.resolve({ error: null }),
        updateUser: () => Promise.resolve({ data: null, error: null }),
        getUser: () => Promise.resolve({ data: null, error: null }),
        getSession: () => Promise.resolve({ data: null, error: null }),
        onAuthStateChange: () => ({ data: null, error: null })
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          download: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } })
        })
      },
      rpc: () => Promise.resolve({ data: null, error: null })
    };
  } else {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseInstance;
};

export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getSupabaseClient();
    return client[prop];
  }
});