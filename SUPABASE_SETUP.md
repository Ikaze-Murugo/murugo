# Supabase Setup for Murugo - Rwanda Real Estate Platform

## Database Schema and RLS Policies

### 0. Clean Up Existing Tables (Run this first if you have existing tables)

```sql
-- Drop existing tables if they exist (run this first)
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS property_images CASCADE;
DROP TABLE IF EXISTS property_amenities CASCADE;
DROP TABLE IF EXISTS amenities CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

### 1. Create Tables

```sql
-- =============================================
-- MURUGO DATABASE SETUP
-- =============================================

-- 1. Create the users table
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'homeowner', 'agent', 'admin')),
    phone_number VARCHAR(20),
    avatar_url TEXT,
    address TEXT,
    city VARCHAR(100),
    state_province VARCHAR(100),
    zip_postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Rwanda',
    bio TEXT,
    license_number VARCHAR(100),
    company VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    verification_documents JSONB,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'villa', 'studio', 'office', 'land', 'commercial')),
    listing_type VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent', 'lease')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'sold', 'rented', 'inactive', 'draft')),
    
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    zip_postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'Rwanda',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    neighborhood VARCHAR(100),
    
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    sqft INTEGER,
    lot_size INTEGER,
    year_built INTEGER,
    garage_spaces INTEGER,
    floors INTEGER,
    parking_spaces INTEGER,
    
    is_furnished BOOLEAN DEFAULT false,
    pets_allowed BOOLEAN DEFAULT false,
    smoking_allowed BOOLEAN DEFAULT false,
    utilities_included JSONB,
    lease_terms JSONB,
    
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    preferred_contact_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_contact_method IN ('email', 'phone', 'both')),
    available_for_viewing JSONB,
    
    admin_notes TEXT,
    rejection_reason TEXT,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    is_featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP WITH TIME ZONE,
    virtual_tour_url TEXT,
    video_url TEXT,
    listing_url_slug VARCHAR(255) UNIQUE,
    
    view_count INTEGER DEFAULT 0,
    inquiry_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create amenities table (FIXED - removed category constraint)
CREATE TABLE IF NOT EXISTS amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create property_amenities junction table
CREATE TABLE IF NOT EXISTS property_amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(property_id, amenity_id)
);

-- 5. Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    image_type VARCHAR(50) DEFAULT 'photo',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);
```

### 2. Insert Sample Data

```sql
-- Insert basic amenities (FIXED - using valid categories)
INSERT INTO amenities (name, category, icon, description) VALUES
('Air Conditioning', 'interior', 'icon-ac', 'Central air conditioning'),
('Heating', 'interior', 'icon-heating', 'Central heating system'),
('Parking', 'exterior', 'icon-parking', 'Parking space available'),
('Garden', 'exterior', 'icon-garden', 'Private garden'),
('Pool', 'exterior', 'icon-pool', 'Swimming pool'),
('WiFi', 'technology', 'icon-wifi', 'High-speed internet'),
('Security System', 'security', 'icon-security', 'Security system installed'),
('Furnished', 'furnishing', 'icon-furniture', 'Fully furnished'),
('Pet Friendly', 'policies', 'icon-pets', 'Pets allowed'),
('Balcony', 'exterior', 'icon-balcony', 'Private balcony'),
('Electricity', 'utilities', 'icon-electricity', 'Electricity included'),
('Water', 'utilities', 'icon-water', 'Water included'),
('Internet', 'technology', 'icon-internet', 'Internet connection'),
('Kitchen', 'interior', 'icon-kitchen', 'Fully equipped kitchen'),
('Laundry', 'interior', 'icon-laundry', 'Laundry facilities')
ON CONFLICT DO NOTHING;

-- Create test properties without owner (we'll add them later)
INSERT INTO properties (
  title, description, property_type, listing_type, status, is_featured,
  address, city, state_province, zip_postal_code, price, bedrooms, bathrooms, sqft, year_built, country
) VALUES 
('Modern Apartment in Kigali', 'Beautiful 2-bedroom apartment in the heart of Kigali city center', 'apartment', 'sale', 'approved', true, '123 KN 4 St, Kigali', 'Kigali', 'Kigali', '00000', 45000000, 2, 2, 120, 2020, 'Rwanda'),
('Luxury Villa in Kigali Heights', 'Stunning 4-bedroom villa with private pool and garden in Kigali Heights', 'villa', 'sale', 'approved', true, '456 KG 7 Ave, Kigali Heights', 'Kigali', 'Kigali', '00000', 120000000, 4, 3.5, 280, 2018, 'Rwanda'),
('Cozy Studio in Remera', 'Perfect studio apartment for young professionals in Remera', 'studio', 'rent', 'approved', true, '789 KG 12 St, Remera', 'Kigali', 'Kigali', '00000', 180000, 0, 1, 60, 2019, 'Rwanda'),
('Family House in Gisozi', 'Spacious 3-bedroom family house in quiet Gisozi neighborhood', 'house', 'sale', 'approved', true, '321 KG 15 Ave, Gisozi', 'Kigali', 'Kigali', '00000', 75000000, 3, 2, 180, 2017, 'Rwanda'),
('Commercial Office Space', 'Modern office space in Kigali business district', 'office', 'rent', 'approved', true, '555 KG 8 St, CBD', 'Kigali', 'Kigali', '00000', 500000, 0, 2, 200, 2021, 'Rwanda')
ON CONFLICT DO NOTHING;
```

### 3. Fix RLS Policies (No Infinite Recursion)

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users table policies (FIXED - No infinite recursion)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Properties table policies
CREATE POLICY "Anyone can view approved properties" ON properties
    FOR SELECT USING (status = 'approved' OR status = 'active');

CREATE POLICY "Users can view their own properties" ON properties
    FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Homeowners and agents can create properties" ON properties
    FOR INSERT WITH CHECK (
        auth.uid() = owner_id AND 
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('homeowner', 'agent', 'admin')
        )
    );

CREATE POLICY "Users can update their own properties" ON properties
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own properties" ON properties
    FOR DELETE USING (auth.uid() = owner_id);

-- Amenities table policies (public read)
CREATE POLICY "Anyone can view amenities" ON amenities
    FOR SELECT USING (true);

-- Property amenities table policies
CREATE POLICY "Anyone can view property amenities" ON property_amenities
    FOR SELECT USING (true);

CREATE POLICY "Property owners can manage property amenities" ON property_amenities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_amenities.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Property images table policies
CREATE POLICY "Anyone can view property images" ON property_images
    FOR SELECT USING (true);

CREATE POLICY "Property owners can manage property images" ON property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = property_images.property_id 
            AND properties.owner_id = auth.uid()
        )
    );

-- Messages table policies
CREATE POLICY "Users can view messages they sent or received" ON messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON messages
    FOR UPDATE USING (auth.uid() = sender_id);

-- Reviews table policies
CREATE POLICY "Anyone can view approved reviews" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can view their own reviews" ON reviews
    FOR SELECT USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can create reviews" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

-- Favorites table policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);
```

### 4. Create Functions for Data Access

```sql
-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
    id UUID,
    email VARCHAR,
    name VARCHAR,
    role VARCHAR,
    phone_number VARCHAR,
    avatar_url TEXT,
    address TEXT,
    city VARCHAR,
    state_province VARCHAR,
    country VARCHAR,
    verification_status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.name,
        u.role,
        u.phone_number,
        u.avatar_url,
        u.address,
        u.city,
        u.state_province,
        u.country,
        u.verification_status,
        u.created_at
    FROM users u
    WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get featured properties
CREATE OR REPLACE FUNCTION get_featured_properties(limit_count INTEGER DEFAULT 6)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    description TEXT,
    property_type VARCHAR,
    listing_type VARCHAR,
    status VARCHAR,
    address TEXT,
    city VARCHAR,
    price DECIMAL,
    bedrooms INTEGER,
    bathrooms DECIMAL,
    sqft INTEGER,
    is_featured BOOLEAN,
    owner_name VARCHAR,
    owner_avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.title,
        p.description,
        p.property_type,
        p.listing_type,
        p.status,
        p.address,
        p.city,
        p.price,
        p.bedrooms,
        p.bathrooms,
        p.sqft,
        p.is_featured,
        u.name as owner_name,
        u.avatar_url as owner_avatar,
        p.created_at
    FROM properties p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.status IN ('approved', 'active')
    AND p.is_featured = true
    ORDER BY p.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. Create a Trigger to Auto-Create User Profile

```sql
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'name', ''), 'user');
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Environment Variables for Vercel

Make sure these are set in your Vercel environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

## Testing the Setup

After running the SQL above:

1. **Check if tables exist**: Go to Supabase Dashboard → Table Editor
2. **Test the connection**: The Properties component will show database status
3. **Verify data**: You should see 5 test properties from Rwanda
4. **Test registration**: When you register a new user, it should automatically create a profile

The infinite recursion error should be fixed, and the login/register should work properly now.

