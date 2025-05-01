import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Delete the test user directly by name
    const { data: users, error: findError } = await supabase
      .from("users")
      .select("id")
      .ilike("business_name", "%ArnavManduriLol%")

    if (findError) {
      return NextResponse.json({ error: "Error finding test users: " + findError.message }, { status: 500 })
    }

    if (users.length === 0) {
      return NextResponse.json({ message: "No test users found" })
    }

    // Delete all related data for each test user
    for (const user of users) {
      const userId = user.id

      // Delete from supplier_profiles
      await supabase.from("supplier_profiles").delete().eq("user_id", userId)

      // Delete from connections
      await supabase.from("connections").delete().eq("supplier_id", userId)
      await supabase.from("connections").delete().eq("restaurant_id", userId)

      // Delete from supplier_listings
      await supabase.from("supplier_listings").delete().eq("supplier_id", userId)

      // Delete the user
      await supabase.from("users").delete().eq("id", userId)
    }

    return NextResponse.json({
      success: true,
      message: `Deleted ${users.length} test users with name containing 'ArnavManduriLol'`,
    })
  } catch (error: any) {
    console.error("Error cleaning up test users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
