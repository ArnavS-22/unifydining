-- Function to check if a column exists
CREATE OR REPLACE FUNCTION create_column_exists_function()
RETURNS void AS $$
BEGIN
  CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
  RETURNS boolean AS $$
  DECLARE
    exists boolean;
  BEGIN
    SELECT COUNT(*) > 0 INTO exists
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name = $2;
    
    RETURN exists;
  END;
  $$ LANGUAGE plpgsql;
END;
$$ LANGUAGE plpgsql;

-- Function to add a column to a table
CREATE OR REPLACE FUNCTION add_column_to_table(
  table_name text, 
  column_name text, 
  column_type text,
  column_default text DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  sql text;
BEGIN
  IF column_default IS NULL THEN
    sql := format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s', 
                 table_name, column_name, column_type);
  ELSE
    sql := format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I %s DEFAULT %s', 
                 table_name, column_name, column_type, column_default);
  END IF;
  
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql;
