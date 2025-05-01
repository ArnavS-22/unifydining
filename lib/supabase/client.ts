import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase URL or Key missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.",
    )
    return null
  }

  // Create a new instance if it doesn't exist
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: "unifydining-auth-token",
        },
      })
      console.log("Supabase client initialized")
    } catch (error) {
      console.error("Error initializing Supabase client:", error)
      return null
    }
  }

  return supabaseInstance
}

// For server components
export const createServerSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "Supabase URL or Key missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.",
    )
    return null
  }

  try {
    return createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("Error creating server Supabase client:", error)
    return null
  }
}
