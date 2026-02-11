import { createClient } from '@supabase/supabase-js';

// Supabase configuration provided by the user
const supabaseUrl = 'https://smodqyxwqwklbqphigcp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtb2RxeXh3cXdrbGJxcGhpZ2NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MjE0NzAsImV4cCI6MjA4NjI5NzQ3MH0.r_9tAB2h5rF2TGpJsNMmylKuVUBUIVc0oZVEjl3tXXc';

/**
 * The Supabase client instance.
 * Initialized with explicit credentials to ensure cloud connectivity is active.
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase client could not be initialized. Please check your URL and Key.");
} else {
  console.log("Supabase Cloud Sync is active.");
}
