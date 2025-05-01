import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Step 1: Check if chat_rooms table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_rooms")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_rooms table exists:", tableCheckError)
      return NextResponse.json({ error: "Failed to check if chat_rooms table exists" }, { status: 500 })
    }

    if (!tableExists) {
      return NextResponse.json(
        {
          error: "Chat tables don't exist yet. Please create them first by visiting /api/create-chat-tables",
        },
        { status: 400 },
      )
    }

    // Step 2: Get all connections
    const { data: connections, error: connectionsError } = await supabase.from("connections").select("*")

    if (connectionsError) {
      console.error("Error fetching connections:", connectionsError)
      return NextResponse.json({ error: "Failed to fetch connections" }, { status: 500 })
    }

    if (!connections || connections.length === 0) {
      return NextResponse.json({ message: "No connections found to create chat rooms for" })
    }

    // Step 3: Create chat rooms for connections that don't have one
    const results = []

    for (const connection of connections) {
      // Check if chat room already exists
      const { data: existingRoom, error: roomCheckError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("restaurant_id", connection.restaurant_id)
        .eq("supplier_id", connection.supplier_id)
        .maybeSingle()

      if (roomCheckError && !roomCheckError.message.includes("No rows found")) {
        console.error("Error checking for existing chat room:", roomCheckError)
        results.push({
          connection_id: connection.id,
          status: "error",
          message: roomCheckError.message,
        })
        continue
      }

      // If room doesn't exist, create it
      if (!existingRoom) {
        const { data: newRoom, error: createError } = await supabase
          .from("chat_rooms")
          .insert({
            restaurant_id: connection.restaurant_id,
            supplier_id: connection.supplier_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (createError) {
          console.error("Error creating chat room:", createError)
          results.push({
            connection_id: connection.id,
            status: "error",
            message: createError.message,
          })
        } else {
          results.push({
            connection_id: connection.id,
            status: "created",
            room_id: newRoom.id,
          })
        }
      } else {
        results.push({
          connection_id: connection.id,
          status: "exists",
          room_id: existingRoom.id,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${connections.length} connections`,
      created: results.filter((r) => r.status === "created").length,
      existing: results.filter((r) => r.status === "exists").length,
      errors: results.filter((r) => r.status === "error").length,
      results,
    })
  } catch (error: any) {
    console.error("Error creating chat rooms:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
