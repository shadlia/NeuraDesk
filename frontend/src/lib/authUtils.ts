/**
 * Utility to manually clear all authentication data
 * Use this if you need to force logout and clear all local storage
 */
export const clearAuthData = async () => {
  // Clear Supabase session
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    await supabase.auth.signOut();
  }
  
  // Clear all localStorage
  localStorage.clear();
  
  // Clear all sessionStorage
  sessionStorage.clear();
  
  // Reload the page
  window.location.href = '/';
};

/**
 * Check if user exists in Supabase Auth
 * Returns true if user exists, false otherwise
 */
export const checkUserExists = async (): Promise<boolean> => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.auth.getUser();
    return !error && !!data.user;
  } catch {
    return false;
  }
};
