// Custom authentication for RatPlace
import { createClient } from "@/lib/supabase/client"

const VALID_USERS = {
  tlxontop: "Thebestrealpasswordever",
  justvicky152: "Ikhouvangames1102?",
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .single()

  if (!error && data !== null) {
    return true
  }

  return VALID_USERS[username as keyof typeof VALID_USERS] === password
}

export async function isSuperAdmin(username: string): Promise<boolean> {
  const supabase = createClient()
  const { data } = await supabase.from("admins").select("is_super_admin").eq("username", username).single()

  return data?.is_super_admin || false
}

export function saveAuthToStorage(username: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("ratplace_user", username)
  }
}

export function getAuthFromStorage(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("ratplace_user")
  }
  return null
}

export function clearAuthFromStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("ratplace_user")
  }
}
