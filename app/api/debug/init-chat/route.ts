import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Step 1: Create chat tables if they don't exist
    console.log("Step 1: Creating chat tables...")
    const { error: createTablesError } = await supabase.rpc("create_chat_tables")

    if (createTablesError) {
      console.error("Error creating chat tables:", createTablesError)
      return NextResponse.json({ error: createTablesError.message }, { status: 500 })
    }

    // Step 2: Check for connections without chat rooms
    console.log("Step 2: Checking for connections without chat rooms...")
    const { data: connections, error: connectionsError } = await supabase.from("connections").select("*")

    if (connectionsError) {
      console.error("Error fetching connections:", connectionsError)
      return NextResponse.json({ error: connectionsError.message }, { status: 500 })
    }

    // Step 3: Create missing chat rooms
    console.log("Step 3: Creating missing chat rooms...")
    const results = []

    for (const connection of connections) {
      // Check if chat room exists for this connection
      const { data: existingRoom, error: roomError } = await supabase
        .from("chat_rooms")
        .select("id")
        .eq("restaurant_id", connection.restaurant_id)
        .eq("supplier_id", connection.supplier_id)
        .maybeSingle()

      if (roomError && !roomError.message.includes("No rows found")) {
        console.error("Error checking for existing chat room:", roomError)
        results.push({
          connection_id: connection.id,
          status: "error",
          message: roomError.message,
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
      message: "Chat system initialized successfully",
      results,
    })
  } catch (error: any) {
    console.error("Error initializing chat system:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
