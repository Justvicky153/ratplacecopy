import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()
  
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "https://qmodpwqphcneipqhpnju.supabase.co"
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtb2Rwd3FwaGNuZWlwcWhwbmp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NDY5NzUsImV4cCI6MjA3NTQyMjk3NX0.Tu1JPtId3Ec1aSMw7QbkGgiMeuE8QlDQU60ahT1EpLA"

  if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    supabaseUrl = "https://qmodpwqphcneipqhpnju.supabase.co"
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Ignore if called from Server Component
        }
      },
    },
  })
}
