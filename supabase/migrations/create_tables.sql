-- Create users table function
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    user_type TEXT NOT NULL CHECK (user_type IN ('restaurant', 'supplier')),
    business_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create restaurant_profiles table function
CREATE OR REPLACE FUNCTION create_restaurant_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS restaurant_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    restaurant_type TEXT NOT NULL,
    cuisine_types TEXT[],
    halal_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create supplier_profiles table function
CREATE OR REPLACE FUNCTION create_supplier_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS supplier_profiles (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_type TEXT NOT NULL,
    certification_authority TEXT,
    product_categories TEXT[],
    delivery_areas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Create connections table function
CREATE OR REPLACE FUNCTION create_connections_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(restaurant_id, supplier_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Create supplier_listings table function
CREATE OR REPLACE FUNCTION create_supplier_listings_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS supplier_listings (
    id SERIAL PRIMARY KEY,
    supplier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price DECIMAL(10, 2),
    unit TEXT,
    certification_details TEXT,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
