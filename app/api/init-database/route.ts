import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Check if users table exists
    const { data: usersTableExists, error: usersTableError } = await supabase
      .from("users")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (usersTableError && !usersTableError.message.includes("does not exist")) {
      console.error("Error checking users table:", usersTableError)
      return NextResponse.json({ error: usersTableError.message }, { status: 500 })
    }

    // Create tables if they don't exist
    if (usersTableError && usersTableError.message.includes("does not exist")) {
      // Create users table
      const { error: createUsersError } = await supabase.rpc("create_users_table")

      if (createUsersError) {
        console.error("Error creating users table:", createUsersError)
        return NextResponse.json({ error: createUsersError.message }, { status: 500 })
      }

      // Create restaurant_profiles table
      const { error: createRestaurantProfilesError } = await supabase.rpc("create_restaurant_profiles_table")

      if (createRestaurantProfilesError) {
        console.error("Error creating restaurant_profiles table:", createRestaurantProfilesError)
        return NextResponse.json({ error: createRestaurantProfilesError.message }, { status: 500 })
      }

      // Create supplier_profiles table
      const { error: createSupplierProfilesError } = await supabase.rpc("create_supplier_profiles_table")

      if (createSupplierProfilesError) {
        console.error("Error creating supplier_profiles table:", createSupplierProfilesError)
        return NextResponse.json({ error: createSupplierProfilesError.message }, { status: 500 })
      }

      // Create connections table
      const { error: createConnectionsError } = await supabase.rpc("create_connections_table")

      if (createConnectionsError) {
        console.error("Error creating connections table:", createConnectionsError)
        return NextResponse.json({ error: createConnectionsError.message }, { status: 500 })
      }

      // Create supplier_listings table
      const { error: createListingsError } = await supabase.rpc("create_supplier_listings_table")

      if (createListingsError) {
        console.error("Error creating supplier_listings table:", createListingsError)
        return NextResponse.json({ error: createListingsError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error: any) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
