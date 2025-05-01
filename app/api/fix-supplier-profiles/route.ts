import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Get all users with user_type = supplier
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

    // For each supplier, check if they have a supplier profile
    for (const supplier of suppliers) {
      const { data: profile, error: profileError } = await supabase
        .from("supplier_profiles")
        .select("id")
        .eq("user_id", supplier.id)
        .maybeSingle()

      if (profileError && !profileError.message.includes("No rows found")) {
        results.push({
          supplier: supplier.email,
          status: "error",
          message: profileError.message,
        })
        continue
      }

      // If no profile exists, create one
      if (!profile) {
        // Get user metadata from auth
        const { data: userData } = await supabase.auth.admin.getUserById(supplier.id)
        const userMetadata = userData?.user?.user_metadata || {}

        const { error: insertError } = await supabase.from("supplier_profiles").insert({
          user_id: supplier.id,
          supplier_type: userMetadata.supplier_type || "other",
          certification_authority: userMetadata.certification || "",
        })

        if (insertError) {
          results.push({
            supplier: supplier.email,
            status: "error",
            message: insertError.message,
          })
        } else {
          results.push({
            supplier: supplier.email,
            status: "created",
            message: "Supplier profile created successfully",
          })
        }
      } else {
        results.push({
          supplier: supplier.email,
          status: "exists",
          message: "Supplier profile already exists",
        })
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error: any) {
    console.error("Error fixing supplier profiles:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
