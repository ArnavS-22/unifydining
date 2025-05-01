"use server"

import { createServerSupabaseClient } from "@/lib/supabase/client"
import { getUser } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// Get or create a chat room between a restaurant and supplier
export async function getChatRoom(restaurantId: string, supplierId: string) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  try {
    // Check if chat_rooms table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_rooms")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_rooms table exists:", tableCheckError)
      throw new Error("Failed to check if chat_rooms table exists")
    }

    if (!tableExists) {
      throw new Error("Chat tables don't exist yet. Please create them first by visiting /api/create-chat-tables")
    }

    // Check if chat room already exists
    const { data: existingRoom, error: roomError } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .eq("supplier_id", supplierId)
      .maybeSingle()

    if (roomError && !roomError.message.includes("No rows found")) {
      console.error("Error checking for existing chat room:", roomError)
      throw new Error("Failed to check for existing chat room")
    }

    // If room exists, return it
    if (existingRoom) {
      return existingRoom
    }

    // Create a new chat room
    const { data: newRoom, error: createError } = await supabase
      .from("chat_rooms")
      .insert({
        restaurant_id: restaurantId,
        supplier_id: supplierId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (createError) {
      console.error("Error creating chat room:", createError)
      throw new Error("Failed to create chat room")
    }

    return newRoom
  } catch (error) {
    console.error("Error in getChatRoom:", error)
    throw error
  }
}

// Send a message in a chat room
export async function sendMessage(roomId: number, message: string) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  const user = await getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Check if chat_messages table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_messages")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_messages table exists:", tableCheckError)
      throw new Error("Failed to check if chat_messages table exists")
    }

    if (!tableExists) {
      throw new Error("Chat tables don't exist yet. Please create them first by visiting /api/create-chat-tables")
    }

    // Insert the message
    const { error: messageError } = await supabase.from("chat_messages").insert({
      room_id: roomId,
      sender_id: user.id,
      message,
      read: false,
      created_at: new Date().toISOString(),
    })

    if (messageError) {
      console.error("Error sending message:", messageError)
      throw new Error("Failed to send message")
    }

    // Update the last_message_at timestamp in the chat room
    const { error: updateError } = await supabase
      .from("chat_rooms")
      .update({
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", roomId)

    if (updateError) {
      console.error("Error updating chat room timestamp:", updateError)
      // Don't throw here, the message was sent successfully
    }

    // Revalidate the chat page to show the new message
    revalidatePath(`/dashboard/chat/${roomId}`)
    revalidatePath("/dashboard/chat")

    return { success: true }
  } catch (error) {
    console.error("Error in sendMessage:", error)
    throw error
  }
}

// Mark messages as read
export async function markMessagesAsRead(roomId: number) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  const user = await getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Check if chat_messages table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_messages")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_messages table exists:", tableCheckError)
      throw new Error("Failed to check if chat_messages table exists")
    }

    if (!tableExists) {
      throw new Error("Chat tables don't exist yet. Please create them first by visiting /api/create-chat-tables")
    }

    // Mark all messages not sent by the current user as read
    const { error } = await supabase
      .from("chat_messages")
      .update({ read: true })
      .eq("room_id", roomId)
      .neq("sender_id", user.id)
      .eq("read", false)

    if (error) {
      console.error("Error marking messages as read:", error)
      throw new Error("Failed to mark messages as read")
    }

    // Revalidate the chat page
    revalidatePath(`/dashboard/chat/${roomId}`)
    revalidatePath("/dashboard/chat")

    return { success: true }
  } catch (error) {
    console.error("Error in markMessagesAsRead:", error)
    throw error
  }
}

// Get all chat rooms for the current user
export async function getChatRooms() {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  const user = await getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  try {
    // Check if chat_rooms table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_rooms")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_rooms table exists:", tableCheckError)
      throw new Error("Failed to check if chat_rooms table exists")
    }

    if (!tableExists) {
      // Return empty array if table doesn't exist yet
      return []
    }

    const userType = user.user_metadata?.user_type

    // Get chat rooms based on user type
    let query = supabase.from("chat_rooms").select(`
      *,
      restaurant:restaurant_id(*),
      supplier:supplier_id(*)
    `)

    // Filter based on user type
    if (userType === "restaurant") {
      query = query.eq("restaurant_id", user.id)
    } else if (userType === "supplier") {
      query = query.eq("supplier_id", user.id)
    } else {
      throw new Error("Invalid user type")
    }

    // Order by last message time
    query = query.order("last_message_at", { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error("Error fetching chat rooms:", error)
      throw new Error("Failed to fetch chat rooms")
    }

    // For each chat room, count unread messages
    const roomsWithUnreadCount = await Promise.all(
      (data || []).map(async (room) => {
        // Check if chat_messages table exists
        const { data: messagesTableExists, error: messagesTableCheckError } = await supabase
          .from("information_schema.tables")
          .select("table_name")
          .eq("table_name", "chat_messages")
          .eq("table_schema", "public")
          .maybeSingle()

        if (messagesTableCheckError || !messagesTableExists) {
          return { ...room, unread_count: 0 }
        }

        const { data: unreadMessages, error: unreadError } = await supabase
          .from("chat_messages")
          .select("id", { count: "exact" })
          .eq("room_id", room.id)
          .eq("read", false)
          .neq("sender_id", user.id)

        if (unreadError) {
          console.error("Error counting unread messages:", unreadError)
          return { ...room, unread_count: 0 }
        }

        return { ...room, unread_count: unreadMessages?.length || 0 }
      }),
    )

    return roomsWithUnreadCount
  } catch (error) {
    console.error("Error in getChatRooms:", error)
    throw error
  }
}

// Get messages for a specific chat room
export async function getChatMessages(roomId: number) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  try {
    // Check if chat_messages table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_messages")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_messages table exists:", tableCheckError)
      throw new Error("Failed to check if chat_messages table exists")
    }

    if (!tableExists) {
      // Return empty array if table doesn't exist yet
      return []
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .select(`
        *,
        sender:sender_id(*)
      `)
      .eq("room_id", roomId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching chat messages:", error)
      throw new Error("Failed to fetch chat messages")
    }

    return data || []
  } catch (error) {
    console.error("Error in getChatMessages:", error)
    throw error
  }
}

// Get chat room details
export async function getChatRoomDetails(roomId: number) {
  const supabase = createServerSupabaseClient()
  if (!supabase) {
    throw new Error("Supabase client not initialized")
  }

  try {
    // Check if chat_rooms table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "chat_rooms")
      .eq("table_schema", "public")
      .maybeSingle()

    if (tableCheckError) {
      console.error("Error checking if chat_rooms table exists:", tableCheckError)
      throw new Error("Failed to check if chat_rooms table exists")
    }

    if (!tableExists) {
      throw new Error("Chat tables don't exist yet. Please create them first by visiting /api/create-chat-tables")
    }

    const { data, error } = await supabase
      .from("chat_rooms")
      .select(`
        *,
        restaurant:restaurant_id(*),
        supplier:supplier_id(*)
      `)
      .eq("id", roomId)
      .single()

    if (error) {
      console.error("Error fetching chat room details:", error)
      throw new Error("Failed to fetch chat room details")
    }

    return data
  } catch (error) {
    console.error("Error in getChatRoomDetails:", error)
    throw error
  }
}
