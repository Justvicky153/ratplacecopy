-- Create admin_applications table for users to apply for admin access
CREATE TABLE IF NOT EXISTS admin_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_username TEXT NOT NULL,
  email TEXT,
  reason TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admins table to store admin accounts
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Insert the super admin (justvicky152)
INSERT INTO admins (username, password, is_super_admin, created_by)
VALUES ('justvicky152', 'Ikhouvangames1102?', TRUE, 'system')
ON CONFLICT (username) DO NOTHING;

-- Insert the other default admin
INSERT INTO admins (username, password, is_super_admin, created_by)
VALUES ('tlxontop', 'Thebestrealpasswordever', FALSE, 'system')
ON CONFLICT (username) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Allow public to insert applications (for applying)
CREATE POLICY "Anyone can submit admin applications"
  ON admin_applications FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to read applications (for admin review)
CREATE POLICY "Anyone can view admin applications"
  ON admin_applications FOR SELECT
  TO public
  USING (true);

-- Allow public to delete applications (for admin management)
CREATE POLICY "Anyone can delete admin applications"
  ON admin_applications FOR DELETE
  TO public
  USING (true);

-- Allow public to read admins (for authentication)
CREATE POLICY "Anyone can view admins"
  ON admins FOR SELECT
  TO public
  USING (true);

-- Allow public to insert admins (for admin management)
CREATE POLICY "Anyone can insert admins"
  ON admins FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public to delete admins (for admin management)
CREATE POLICY "Anyone can delete admins"
  ON admins FOR DELETE
  TO public
  USING (true);
