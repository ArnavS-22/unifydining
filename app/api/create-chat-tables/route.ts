import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/client"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    if (!supabase) {
      return NextResponse.json({ error: "Supabase client initialization failed" }, { status: 500 })
    }

    // Create chat_rooms table directly with SQL
    const createChatRoomsTableSQL = `
      CREATE TABLE IF NOT EXISTS chat_rooms (
        id SERIAL PRIMARY KEY,
        restaurant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        supplier_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(restaurant_id, supplier_id)
      );
    `

    const { error: chatRoomsError } = await supabase.rpc("exec_sql", { sql: createChatRoomsTableSQL })

    if (chatRoomsError) {
      // If exec_sql function doesn't exist, try direct query
      const { error: directError } = await supabase.from("_exec_sql").rpc("exec", { query: createChatRoomsTableSQL })

      if (directError) {
        console.error("Error creating chat_rooms table:", directError)
        return NextResponse.json(
          {
            error: "Failed to create chat_rooms table. Please run the SQL directly in Supabase SQL editor.",
            sql: createChatRoomsTableSQL,
          },
          { status: 500 },
        )
      }
    }

    // Create chat_messages table directly with SQL
    const createChatMessagesTableSQL = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
        sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: chatMessagesError } = await supabase.rpc("exec_sql", { sql: createChatMessagesTableSQL })

    if (chatMessagesError) {
      // If exec_sql function doesn't exist, try direct query
      const { error: directError } = await supabase.from("_exec_sql").rpc("exec", { query: createChatMessagesTableSQL })

      if (directError) {
        console.error("Error creating chat_messages table:", directError)
        return NextResponse.json(
          {
            error: "Failed to create chat_messages table. Please run the SQL directly in Supabase SQL editor.",
            sql: createChatMessagesTableSQL,
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Chat tables created successfully",
      sql: {
        chatRooms: createChatRoomsTableSQL,
        chatMessages: createChatMessagesTableSQL,
      },
    })
  } catch (error: any) {
    console.error("Error creating chat tables:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
