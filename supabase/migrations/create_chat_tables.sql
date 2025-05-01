-- Function to create chat tables
CREATE OR REPLACE FUNCTION create_chat_tables()
RETURNS void AS $$
BEGIN
  -- Create chat_rooms table
  CREATE TABLE IF NOT EXISTS chat_rooms (
    id SERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, supplier_id)
  );

  -- Create chat_messages table
  CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
