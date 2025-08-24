import { createClient } from '@supabase/supabase-js'

// 服务端 Supabase 客户端
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lpcxnfymswjetfiiwvmc.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwY3huZnltc3dqZXRmaWl3dm1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MjgzOTYsImV4cCI6MjA3MTUwNDM5Nn0.AhOzFEwcdyM7jPObqwJGn5GQt3bQZrUhlyJzBY2Gv44'

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })
}
