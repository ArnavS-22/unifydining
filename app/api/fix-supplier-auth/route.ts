import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Get all users with user_type = supplier from the users table
    const { data: suppliers, error: suppliersError } = await supabase
      .from("users")
      .select("id, email, business_name, user_type")
      .eq("user_type", "supplier")

    if (suppliersError) {
      return NextResponse.json({ error: suppliersError.message }, { status: 500 })
    }

    if (!suppliers || suppliers.length === 0) {
      return NextResponse.json({ message: "No supplier users found" })
    }

    const results = []

    // For each supplier, ensure they are confirmed in auth
    for (const supplier of suppliers) {
      try {
        // Get user from auth
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(supplier.id)

        if (userError) {
          results.push({
            supplier: supplier.email,
            status: "error",
            message: userError.message,
          })
          continue
        }

        // Update user to be confirmed
        const { error: confirmError } = await supabase.auth.admin.updateUserById(supplier.id, { email_confirm: true })

        if (confirmError) {
          results.push({
            supplier: supplier.email,
            status: "error",
            message: confirmError.message,
          })
        } else {
          results.push({
            supplier: supplier.email,
            status: "fixed",
            message: "Supplier email confirmed successfully",
          })
        }
      } catch (error: any) {
        results.push({
          supplier: supplier.email,
          status: "error",
          message: error.message,
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Error fixing supplier auth:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
