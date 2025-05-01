import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function DELETE(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Get the user by business name
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .ilike("business_name", "%ArnavManduriLol%")
      .single()

    if (userError) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userData.id

    // Delete related records first (to avoid foreign key constraints)
    // Delete from supplier_profiles
    await supabase.from("supplier_profiles").delete().eq("user_id", userId)

    // Delete from connections
    await supabase.from("connections").delete().eq("supplier_id", userId)
    await supabase.from("connections").delete().eq("restaurant_id", userId)

    // Delete from supplier_listings
    await supabase.from("supplier_listings").delete().eq("supplier_id", userId)

    // Finally delete the user from users table
    const { error: deleteError } = await supabase.from("users").delete().eq("id", userId)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Test user deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting test user:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
