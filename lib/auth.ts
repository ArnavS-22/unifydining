import { getSupabaseClient } from "./supabase/client"

interface UserData {
  business_name: string
  phone: string
  address: string
  user_type: string
  restaurant_type?: string
  supplier_type?: string
  certification?: string
  [key: string]: any
}

export async function signUp(email: string, password: string, userData: UserData) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.")
  }

  try {
    console.log("Starting signup process for:", email, "as", userData.user_type)

    // First, create the auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    })

    if (error) {
      console.error("Auth signup error:", error)
      throw error
    }

    // If successful and we have a user, insert the additional profile data
    if (data.user) {
      const userId = data.user.id
      console.log("User created successfully with ID:", userId)

      // IMPORTANT: Disable email confirmation requirement for all users
      try {
        // Update user to be confirmed immediately
        const { error: confirmError } = await supabase.auth.admin.updateUserById(userId, { email_confirm: true })

        if (confirmError) {
          console.error("Error confirming user email:", confirmError)
          // Continue despite error
        } else {
          console.log("User email confirmed automatically")
        }
      } catch (confirmErr) {
        console.error("Error in email confirmation process:", confirmErr)
        // Continue despite error
      }

      try {
        // Insert into users table
        const { error: userError } = await supabase.from("users").insert({
          id: userId,
          email: email,
          user_type: userData.user_type,
          business_name: userData.business_name,
          phone: userData.phone,
          address: userData.address,
        })

        if (userError) {
          console.error("Error inserting user data:", userError)
          // Continue despite error - we don't want to prevent signup if just the profile fails
        } else {
          console.log("User data inserted into users table")
        }

        // Insert into the appropriate profile table based on user type
        if (userData.user_type === "restaurant") {
          const { error: profileError } = await supabase.from("restaurant_profiles").insert({
            user_id: userId,
            restaurant_type: userData.restaurant_type || "other",
          })

          if (profileError) {
            console.error("Error inserting restaurant profile:", profileError)
            // Continue despite error
          } else {
            console.log("Restaurant profile created successfully")
          }
        } else if (userData.user_type === "supplier") {
          console.log("Creating supplier profile with data:", {
            user_id: userId,
            supplier_type: userData.supplier_type,
            certification_authority: userData.certification,
          })

          const { error: profileError } = await supabase.from("supplier_profiles").insert({
            user_id: userId,
            supplier_type: userData.supplier_type || "other",
            certification_authority: userData.certification || "",
          })

          if (profileError) {
            console.error("Error inserting supplier profile:", profileError)
            // Continue despite error
          } else {
            console.log("Supplier profile created successfully")
          }
        }

        // Send notification email about new signup using our API route
        try {
          // Use a relative URL for API calls - this works regardless of where the app is hosted
          const apiUrl = "/api/notify-signup"

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userEmail: email,
              businessName: userData.business_name,
              userType: userData.user_type,
              phone: userData.phone,
              address: userData.address,
              restaurantType: userData.restaurant_type || "Not specified",
              supplierType: userData.supplier_type || "Not specified",
              certification: userData.certification || "Not specified",
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            console.error("Email notification failed:", errorData)
          } else {
            console.log("Email notification sent successfully")
          }
        } catch (notificationError) {
          console.error("Error sending signup notification:", notificationError)
          // Don't throw the error - we don't want to fail signup if just the email fails
        }
      } catch (error) {
        console.error("Error saving profile data:", error)
        // Even if profile data fails, we return the auth user
      }
    }

    return { data, error: null }
  } catch (error: any) {
    console.error("Signup process error:", error)
    return { data: null, error }
  }
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.")
  }

  console.log("Signing in user:", email)

  try {
    // Simplified login - just use the basic signInWithPassword method
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Supabase auth error:", error)
      return { data: null, error }
    }

    console.log("Sign in successful for:", data.user?.email)
    return { data, error: null }
  } catch (error: any) {
    console.error("Unexpected error during sign in:", error)
    return { data: null, error }
  }
}

export async function signOut() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.")
  }

  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile() {
  const supabase = getSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client is not initialized. Check your environment variables.")
  }

  const user = await getUser()

  if (!user) {
    return null
  }

  // Get the user type from the metadata
  const userType = user.user_metadata?.user_type

  // Get the user's profile data
  if (userType === "restaurant") {
    const { data, error } = await supabase
      .from("restaurant_profiles")
      .select(`
        *,
        users:user_id (*)
      `)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching restaurant profile:", error)
      return null
    }

    return data
  } else if (userType === "supplier") {
    const { data, error } = await supabase
      .from("supplier_profiles")
      .select(`
        *,
        users:user_id (*)
      `)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching supplier profile:", error)
      return null
    }

    return data
  }

  return null
}
