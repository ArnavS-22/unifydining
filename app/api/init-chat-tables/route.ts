import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    console.log("Initializing chat tables...")

    // Check if chat_rooms table exists
    const { data: chatRoomsExist, error: checkError } = await supabase
      .from("chat_rooms")
      .select("id")
      .limit(1)
      .maybeSingle()

    if (checkError && !checkError.message.includes("does not exist")) {
      console.error("Error checking chat_rooms table:", checkError)
    }

    // Create chat tables if they don't exist
    const { error: chatTablesError } = await supabase.rpc("create_chat_tables")

    if (chatTablesError) {
      console.error("Error creating chat tables:", chatTablesError)
      return NextResponse.json({ error: chatTablesError.message }, { status: 500 })
    }

    console.log("Chat tables initialized successfully")
    return NextResponse.json({ success: true, message: "Chat tables initialized successfully" })
  } catch (error: any) {
    console.error("Database initialization error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
