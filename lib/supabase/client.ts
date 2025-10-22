import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://qmodpwqphcneipqhpnju.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtb2Rwd3FwaGNuZWlwcWhwbmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDY5NzUsImV4cCI6MjA3NTQyMjk3NX0.Tu1JPtId3Ec1aSMw7QbkGgiMeuE8QlDQU60ahT1EpLA"
  
  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('Invalid Supabase URL, using fallback')
    return createBrowserClient("https://qmodpwqphcneipqhpnju.supabase.co", supabaseAnonKey)
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
