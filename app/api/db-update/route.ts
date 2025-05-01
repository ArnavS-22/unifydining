import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Check if the column exists
    const { data: columnExists, error: columnCheckError } = await supabase
      .rpc("column_exists", { table_name: "supplier_listings", column_name: "is_available" })
      .single()

    if (columnCheckError) {
      // Create the function if it doesn't exist
      await supabase.rpc("create_column_exists_function")

      // Try again
      const { data: retryColumnExists, error: retryError } = await supabase
        .rpc("column_exists", { table_name: "supplier_listings", column_name: "is_available" })
        .single()

      if (retryError) {
        return NextResponse.json({ error: "Failed to check column existence" }, { status: 500 })
      }

      if (!retryColumnExists) {
        // Add the column
        const { error: addColumnError } = await supabase.rpc("add_column_to_table", {
          table_name: "supplier_listings",
          column_name: "is_available",
          column_type: "BOOLEAN",
          column_default: "TRUE",
        })

        if (addColumnError) {
          return NextResponse.json({ error: "Failed to add column" }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: "Column added successfully" })
      }
    }

    return NextResponse.json({ success: true, message: "Column already exists or was added successfully" })
  } catch (error: any) {
    console.error("Database update error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
